// src/respuestas/services/respuestas.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Encuesta } from '../encuestas/entities/encuesta.entity';
import { Respuesta } from '../respuestas/entities/respuesta.entity';
import { RespuestaOpcion } from '../respuestas-opciones/entities/respuestas-opcione.entity';
import { RespuestaAbierta } from '../respuestas-abiertas/entities/respuestas-abierta.entity';
import { CreateRespuestaDto } from './dto/create-respuesta.dto';

@Injectable()
export class RespuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestaRepository: Repository<Encuesta>,
    @InjectRepository(Respuesta)
    private respuestaRepository: Repository<Respuesta>,
    @InjectRepository(RespuestaOpcion)
    private respuestaOpcionRepository: Repository<RespuestaOpcion>,
    @InjectRepository(RespuestaAbierta)
    private respuestaAbiertaRepository: Repository<RespuestaAbierta>,
  ) {}

  async crearRespuesta(tokenRespuesta: string, dto: CreateRespuestaDto) {
    // 1. Validar token y obtener encuesta con preguntas y opciones
    const encuesta = await this.encuestaRepository.findOne({
      where: { token_respuesta: tokenRespuesta },
      relations: ['preguntas', 'preguntas.opciones'],
    });
    if (!encuesta) {
      throw new NotFoundException('Token inválido o encuesta no existe');
    }

    // 2. Crear set de IDs válidos
    const idsPreguntas = new Set(encuesta.preguntas.map((p) => p.id));
    const idsOpciones = new Set(
      encuesta.preguntas.flatMap((p) => p.opciones?.map((o) => o.id) || []),
    );

    // 3. Crear respuesta maestra
    const respuesta = await this.respuestaRepository.save({
      encuesta: { id: encuesta.id },
    });

    // 4. Guardar respuestas abiertas (con validación)
    for (const abierta of dto.respuestas_abiertas) {
      if (!idsPreguntas.has(abierta.id_pregunta)) {
        throw new BadRequestException(
          `La pregunta ${abierta.id_pregunta} no pertenece a esta encuesta`,
        );
      }

      await this.respuestaAbiertaRepository.save({
        respuesta: { id: respuesta.id },
        pregunta: { id: abierta.id_pregunta },
        texto: abierta.texto,
      });
    }

    // 5. Guardar respuestas de opciones (con validación)
    for (const opcion of dto.respuestas_opciones) {
      if (!idsPreguntas.has(opcion.id_pregunta)) {
        throw new BadRequestException(
          `La pregunta ${opcion.id_pregunta} no pertenece a esta encuesta`,
        );
      }

      for (const idOpcion of opcion.id_opciones) {
        if (!idsOpciones.has(idOpcion)) {
          throw new BadRequestException(
            `La opción ${idOpcion} no pertenece a esta encuesta`,
          );
        }

        await this.respuestaOpcionRepository.save({
          respuesta: { id: respuesta.id },
          pregunta: { id: opcion.id_pregunta },
          opcion: { id: idOpcion },
        });
      }
    }
  }

  async obtenerResultados(tokenResultados: string) {
    // 1. Obtener encuesta con relaciones
    const encuesta = await this.encuestaRepository.findOne({
      where: { token_resultados: tokenResultados },
      relations: [
        'preguntas',
        'preguntas.opciones',
        'respuestas',
        'respuestas.respuestasAbiertas',
        'respuestas.respuestasAbiertas.pregunta',
        'respuestas.opciones',
        'respuestas.opciones.opcion',
      ],
    });

    if (!encuesta) {
      throw new NotFoundException('Encuesta no encontrada');
    }

    // 2. Inicializar estructura de resultados
    const resultados = {
      encuesta: {
        id: encuesta.id,
        nombre: encuesta.nombre,
        totalRespuestas: encuesta.respuestas?.length || 0, // Usamos las respuestas cargadas
        preguntas: [] as any[],
      },
    };

    // 3. Procesar cada pregunta
    for (const pregunta of encuesta.preguntas || []) {
      const preguntaResultado = {
        id: pregunta.id,
        texto: pregunta.texto,
        tipo: pregunta.tipo,
        respuestas: [] as any[],
      };

      if (pregunta.tipo === 'ABIERTA') {
        // Procesar respuestas abiertas
        const respuestas = (encuesta.respuestas || [])
          .flatMap((r) => r.respuestasAbiertas || [])
          .filter((ra) => ra?.pregunta?.id === pregunta.id) // ← Usa la relación pregunta.id
          .map((ra) => ra.texto);

        preguntaResultado.respuestas = respuestas;
      } else {
        // Procesar opciones múltiples
        preguntaResultado.respuestas = (pregunta.opciones || []).map(
          (opcion) => {
            const count = (encuesta.respuestas || [])
              .flatMap((r) => r.opciones || [])
              .filter((ro) => ro?.opcion?.id === opcion.id).length;

            return {
              opcion: opcion.texto,
              count,
              porcentaje:
                resultados.encuesta.totalRespuestas > 0
                  ? Math.round(
                      (count / resultados.encuesta.totalRespuestas) * 100,
                    )
                  : 0,
            };
          },
        );
      }

      resultados.encuesta.preguntas.push(preguntaResultado);
    }

    return resultados;
  }
}
