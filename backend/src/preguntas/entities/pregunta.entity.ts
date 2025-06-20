import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Encuesta } from './../../encuestas/entities/encuesta.entity';
import { Exclude } from 'class-transformer';
import { Opcion } from './../../opciones/entities/opcion.entity';
import { TiposRespuestaEnum } from './../enums/tipos-respuestas.enum';
import { RespuestaAbierta } from '../../respuestas-abiertas/entities/respuestas-abierta.entity';

@Entity({ name: 'preguntas' })
export class Pregunta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: number;

  @Column()
  texto: string;

  @Column({ type: 'enum', enum: TiposRespuestaEnum })
  tipo: TiposRespuestaEnum;

  @ManyToOne(() => Encuesta)
  @JoinColumn({ name: 'id_encuesta' })
  @Exclude()
  encuesta: Encuesta;

  @OneToMany(() => Opcion, (opcion) => opcion.pregunta, { cascade: ['insert'] })
  opciones: Opcion[];

  @OneToMany(
    () => RespuestaAbierta,
    (respuestaAbierta) => respuestaAbierta.pregunta,
  )
  respuestasAbiertas: RespuestaAbierta[];
}
