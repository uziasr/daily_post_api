import { Migration } from '@mikro-orm/migrations';

export class Migration20201230063525 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" jsonb not null, "title" text not null);');
  }

}
