// src/respuestas/entities/respuesta.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Encuesta } from '../../encuestas/entities/encuesta.entity';
import { RespuestaOpcion } from '../../respuestas-opciones/entities/respuestas-opcione.entity';
import { RespuestaAbierta } from '../../respuestas-abiertas/entities/respuestas-abierta.entity';

@Entity('respuestas')
export class Respuesta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) // Opcional: Puede ser útil para analytics no identificables
  fecha_respuesta: Date;

  @ManyToOne(() => Encuesta)
  @JoinColumn({ name: 'encuestaId' }) // ← Nombre exacto con comillas
  encuesta: Encuesta;

  // Relaciones con respuestas específicas
  @OneToMany(
    () => RespuestaOpcion,
    (respuestaOpcion) => respuestaOpcion.respuesta,
  )
  opciones: RespuestaOpcion[];

  @OneToMany(
    () => RespuestaAbierta,
    (respuestaAbierta) => respuestaAbierta.respuesta,
  )
  respuestasAbiertas: RespuestaAbierta[];
}
