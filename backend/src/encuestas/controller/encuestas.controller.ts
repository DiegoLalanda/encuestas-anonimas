import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  Patch,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Encuesta } from '../entities/encuesta.entity';
import { EncuestasService } from '../services/encuestas.service';
import { CreateEncuestaDto } from '../dto/create-encuesta.dto';
import { GetEncuestaDto } from '../dto/get-encuesta.dto';
import { UpdateEncuestaDto } from '../dto/update-encuesta.dto';
import { ApiResponse } from '../../shared/response.dto';

@ApiTags('Encuestas')
@Controller('encuestas')
export class EncuestasController {
  constructor(private readonly encuestasService: EncuestasService) {}

  // Crea una encuesta para el creador identificado
  @Post('creador/:token_dashboard')
  @ApiOperation({ summary: 'Crear una nueva encuesta para un creador' })
  @ApiParam({ name: 'token_dashboard', description: 'UUID del creador' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Encuesta creada con éxito.',
  }) //
  async createEncuesta(
    @Param('token_dashboard', new ParseUUIDPipe()) token: string,
    @Body() dto: CreateEncuestaDto,
  ): Promise<ApiResponse> {
    const encuesta = await this.encuestasService.crearEncuesta(dto, token);
    return new ApiResponse(
      'success',
      'Encuesta creada.',
      HttpStatus.CREATED,
      encuesta,
    );
  }
  // Devuelve todas las encuestas de ese creador
  @Get('creador/:token_dashboard')
  @ApiOperation({ summary: 'Listar encuestas de un creador' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Encuestas obtenidas correctamente.',
  })
  async findByCreador(
    @Param('token_dashboard', new ParseUUIDPipe()) token: string,
    @Query() query: GetEncuestaDto,
  ): Promise<ApiResponse> {
    const { data, total, page, limit, creadorEmail } =
      await this.encuestasService.obtenerEncuestasPorTokenCreador(token, query);

    const message = total
      ? 'Encuestas encontradas para el creador.'
      : 'Este creador no tiene encuestas aún.';
    return new ApiResponse(
      'success',
      message,
      HttpStatus.OK,
      creadorEmail,
      data,
      {
        total,
        page,
        limit,
      },
    );
  }

  // Devuelve una única encuesta de ese creador por ID de encuesta
  @Get('creador/:token_dashboard/encuesta/:id')
  @ApiOperation({ summary: 'Obtener una encuesta de un creador por su ID' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Encuesta obtenida correctamente.',
  })
  async findOneByCreador(
    @Param('token_dashboard', new ParseUUIDPipe()) token: string,
    @Param('id', ParseIntPipe) encuestaId: number,
  ): Promise<ApiResponse> {
    const encuesta =
      await this.encuestasService.obtenerEncuestaPorTokenCreadorYId(
        token,
        encuestaId,
      );

    const message = encuesta
      ? 'Encuesta encontrada para el creador.'
      : 'Encuesta no encontrada para este creador.';
    return new ApiResponse('success', message, HttpStatus.OK, encuesta);
  }

  //	Devuelve el token_respuesta para compartir
  @Get('/creador/:token_dashboard/:id_encuesta/token-participacion')
  @ApiOperation({
    summary: 'Obtener token_respuesta de una encuesta para participación',
  })
  @ApiParam({
    name: 'token_dashboard',
    description: 'UUID del creador de la encuesta',
  })
  @ApiParam({
    name: 'id_encuesta',
    description: 'ID numérico de la encuesta',
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Token de respuesta obtenido correctamente.',
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Encuesta no encontrada o no pertenece al creador.',
  })
  async getTokenRespuesta(
    @Param('token_dashboard', new ParseUUIDPipe()) tokenDashboard: string,
    @Param('id_encuesta', new ParseIntPipe()) idEncuesta: number,
  ): Promise<ApiResponse> {
    const tokenRespuesta = await this.encuestasService.obtenerTokenRespuesta(
      tokenDashboard,
      idEncuesta,
    );

    return new ApiResponse(
      'success',
      'Token de respuesta obtenido correctamente.',
      HttpStatus.OK,
      { token_respuesta: tokenRespuesta },
    );
  }

  //Dado el token v4 (enlace de participacion) devuelve nombre + preguntas + opciones
  @Get('/participacion/:token_respuesta')
  @ApiOperation({ summary: 'Obtener encuesta por token_respuesta (UUID v4)' })
  @ApiParam({
    name: 'token_respuesta',
    description: 'Token de respuesta (UUID v4)',
  })
  // @ApiParam({ name: 'token', description: 'Token de respuesta (UUID v4)' })
  async getEncuestaParaResponder(
    @Param('token_respuesta', new ParseUUIDPipe({ version: '4' }))
    tokenrespuesta: string,
  ): Promise<ApiResponse> {
    const encuesta =
      await this.encuestasService.findEncuestaByToken(tokenrespuesta);
    const payload = {
      nombre: encuesta.nombre,
      preguntas: encuesta.preguntas.map((p) => ({
        id: p.id,
        texto: p.texto,
        tipo: p.tipo,
        opciones: p.opciones?.map((o) => ({ id: o.id, texto: o.texto })) || [],
      })),
    };
    return new ApiResponse(
      'success',
      'Encuesta cargada correctamente.',
      HttpStatus.OK,
      payload,
    );
  }

  // Publica una encuesta cambiando su estado a PUBLICADA
  @Patch('creador/:token_dashboard/encuesta/:id/publicar')
  @ApiOperation({
    summary: 'Publicar una encuesta (cambiar estado a PUBLICADA)',
  })
  @ApiParam({ name: 'token_dashboard', description: 'UUID del creador' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico de la encuesta',
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Encuesta publicada correctamente.',
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Encuesta o creador no encontrados.',
  })
  async publicarEncuesta(
    @Param('token_dashboard', new ParseUUIDPipe()) token: string,
    @Param('id', ParseIntPipe) encuestaId: number,
  ): Promise<ApiResponse> {
    const encuestaPublicada = await this.encuestasService.publicarEncuesta(
      token,
      encuestaId,
    );
    return new ApiResponse(
      'success',
      'Encuesta publicada correctamente.',
      HttpStatus.OK,
      { tipo: encuestaPublicada },
    );
  }

  @Put('creador/:token_dashboard/encuesta/:id/actualizar')
  @ApiOperation({ summary: 'Actualizar datos básicos de una encuesta' })
  @ApiParam({ name: 'token_dashboard', description: 'UUID del creador' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico de la encuesta',
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Encuesta actualizada correctamente.',
    type: ApiResponse,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Encuesta o creador no encontrados.',
  })
  async actualizarDatosEncuesta(
    @Param('token_dashboard', new ParseUUIDPipe()) token: string,
    @Param('id', new ParseIntPipe()) encuestaId: number,
    @Body() dto: UpdateEncuestaDto,
  ): Promise<ApiResponse<Encuesta>> {
    const updated = await this.encuestasService.updateEncuesta(
      token,
      encuestaId,
      dto,
    );
    return new ApiResponse(
      'success',
      'Encuesta actualizada correctamente.',
      HttpStatus.OK,
      updated,
    );
  }
}
