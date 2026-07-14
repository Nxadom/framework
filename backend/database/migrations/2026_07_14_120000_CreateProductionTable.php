<?php
declare(strict_types=1);

use App\System\Database\NexaMigration;
use App\System\Database\NexaSchema;

/**
 * Tabel production — struktur mengikuti dump `database/migrations/production.sql`.
 * Data sample tetap di production.sql (import manual bila perlu).
 */
class CreateProductionTable extends NexaMigration
{
    public function up(): void
    {
        if ($this->tableExists('production')) {
            return;
        }

        $this->createTable('production', function (NexaSchema $table) {
            $table->column('id', 'INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY');
            $table->column('authorization', 'VARCHAR(255) DEFAULT NULL');
            $table->column('appid', 'BIGINT(20) DEFAULT NULL');
            $table->column('endpoint', 'VARCHAR(255) DEFAULT NULL');
            $table->column('method_get', 'TINYINT(1) DEFAULT NULL');
            $table->column('method_post', 'TINYINT(1) DEFAULT NULL');
            $table->column('method_put', 'TINYINT(1) DEFAULT NULL');
            $table->column('method_patch', 'TINYINT(1) DEFAULT NULL');
            $table->column('method_options', 'TINYINT(1) DEFAULT NULL');
            $table->column('method_delete', 'TINYINT(1) DEFAULT NULL');
            $table->column('expiration', 'JSON DEFAULT NULL');
            $table->column('build_query', 'JSON DEFAULT NULL');
            $table->column('description', 'TEXT DEFAULT NULL');
            $table->column('appname', 'VARCHAR(255) DEFAULT NULL');
            $table->column('developer', 'VARCHAR(255) DEFAULT NULL');
            $table->column('version', 'VARCHAR(50) DEFAULT NULL');
            $table->column('userid', 'INT(11) DEFAULT NULL');
            $table->column('development', 'JSON DEFAULT NULL');
            $table->column('created_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
        });
    }

    public function down(): void
    {
        $this->dropTable('production');
    }
}
