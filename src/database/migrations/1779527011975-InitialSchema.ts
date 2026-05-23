import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1779527011975 implements MigrationInterface {
    name = 'InitialSchema1779527011975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`admin_users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(100) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_2873882c38e8c07d98cb64f962\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`instruction_steps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`recipe_id\` int NOT NULL, \`step_number\` int NOT NULL, \`instruction\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ingredients\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(150) NOT NULL, \`slug\` varchar(150) NOT NULL, UNIQUE INDEX \`IDX_a955029b22ff66ae9fef2e161f\` (\`name\`), UNIQUE INDEX \`IDX_85c50d1d5f69b9e727a8657003\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recipe_ingredients\` (\`id\` int NOT NULL AUTO_INCREMENT, \`recipe_id\` int NOT NULL, \`ingredient_id\` int NOT NULL, \`quantity\` varchar(100) NULL, \`sort_order\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recipes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`image_url\` varchar(500) NULL, \`prep_time_minutes\` int NULL, \`cook_time_minutes\` int NULL, \`servings\` tinyint NOT NULL DEFAULT '1', \`cuisine_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cuisines\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`slug\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_11e2cf58b4ba03e84fe3dd0f00\` (\`name\`), UNIQUE INDEX \`IDX_454d7d111836fd30f49a7a9ebb\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`instruction_steps\` ADD CONSTRAINT \`FK_66d52f94b68657e2f48b7243267\` FOREIGN KEY (\`recipe_id\`) REFERENCES \`recipes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recipe_ingredients\` ADD CONSTRAINT \`FK_f240137e0e13bed80bdf64fed53\` FOREIGN KEY (\`recipe_id\`) REFERENCES \`recipes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recipe_ingredients\` ADD CONSTRAINT \`FK_133545365243061dc2c55dc1373\` FOREIGN KEY (\`ingredient_id\`) REFERENCES \`ingredients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recipes\` ADD CONSTRAINT \`FK_cfa3546295674cda2522d1ee80b\` FOREIGN KEY (\`cuisine_id\`) REFERENCES \`cuisines\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`recipes\` DROP FOREIGN KEY \`FK_cfa3546295674cda2522d1ee80b\``);
        await queryRunner.query(`ALTER TABLE \`recipe_ingredients\` DROP FOREIGN KEY \`FK_133545365243061dc2c55dc1373\``);
        await queryRunner.query(`ALTER TABLE \`recipe_ingredients\` DROP FOREIGN KEY \`FK_f240137e0e13bed80bdf64fed53\``);
        await queryRunner.query(`ALTER TABLE \`instruction_steps\` DROP FOREIGN KEY \`FK_66d52f94b68657e2f48b7243267\``);
        await queryRunner.query(`DROP INDEX \`IDX_454d7d111836fd30f49a7a9ebb\` ON \`cuisines\``);
        await queryRunner.query(`DROP INDEX \`IDX_11e2cf58b4ba03e84fe3dd0f00\` ON \`cuisines\``);
        await queryRunner.query(`DROP TABLE \`cuisines\``);
        await queryRunner.query(`DROP TABLE \`recipes\``);
        await queryRunner.query(`DROP TABLE \`recipe_ingredients\``);
        await queryRunner.query(`DROP INDEX \`IDX_85c50d1d5f69b9e727a8657003\` ON \`ingredients\``);
        await queryRunner.query(`DROP INDEX \`IDX_a955029b22ff66ae9fef2e161f\` ON \`ingredients\``);
        await queryRunner.query(`DROP TABLE \`ingredients\``);
        await queryRunner.query(`DROP TABLE \`instruction_steps\``);
        await queryRunner.query(`DROP INDEX \`IDX_2873882c38e8c07d98cb64f962\` ON \`admin_users\``);
        await queryRunner.query(`DROP TABLE \`admin_users\``);
    }

}
