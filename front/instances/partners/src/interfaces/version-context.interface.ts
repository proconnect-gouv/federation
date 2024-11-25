/* istanbul ignore file */

// declarative file
import type { JSONFieldType } from '@fc/dto2form';

export interface VersionContextInterface {
  schema: JSONFieldType[];
  title: string;
  initialValues: Record<string, unknown>;
}
