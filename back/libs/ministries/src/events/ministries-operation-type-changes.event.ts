import { IEvent } from '@nestjs/cqrs';

/** @TODO Voir les nommages des Event/handler qui écoutent les modifications de mongo*/
export class MinistriesOperationTypeChangesEvent implements IEvent {}
