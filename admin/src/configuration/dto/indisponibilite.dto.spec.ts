import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { IndisponibiliteDTO } from './indisponibilite.dto';

describe('Indisponibilite (Data Transfer Object)', () => {
  const indisponibilite = {
    message: 'Foundation is the futur',
    dateDebut: '2020-01-15',
    heureDebut: '09:00',
    dateFin: '2020-01-15',
    heureFin: '10:00',
    activateMessage: 'true', // transformed in boolean in the DTO
  };

  it('Should validate all properties', async () => {
    // When | Action
    const messagetoCLass = plainToClass(IndisponibiliteDTO, indisponibilite);
    const result = await validate(messagetoCLass);

    // Then | Assert
    expect(result).toEqual([]);
  });

  it('Should not validate message property to prevent XSS attacks', async () => {
    // When | Action
    const messagetoCLass = plainToClass(IndisponibiliteDTO, {
      ...indisponibilite,
      message: `<script>alert('XSS')</script>`,
    });
    const result = await validate(messagetoCLass);

    // Then | Assert
    expect(result.length).toEqual(1);
    expect(result[0].constraints.matches).toEqual(
      "message must match /^[A-Za-z0-9-\\sàâéêèëîïôùç\\'\\.,!]+$/ regular expression",
    );
  });
});
