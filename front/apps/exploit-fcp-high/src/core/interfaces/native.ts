/* istanbul ignore file */

// declarative file
import { ChangeEvent, MouseEventHandler } from 'react';

export type LinkEventType = MouseEventHandler<HTMLAnchorElement>;

export type ButtonEventType = MouseEventHandler<HTMLButtonElement>;

export type TextInputChangeType = ChangeEvent<HTMLInputElement>;

export type AreaInputChangeType = ChangeEvent<HTMLTextAreaElement>;
