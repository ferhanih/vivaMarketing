<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared('
    CREATE TRIGGER updating_priceattime_INSERT_products
    AFTER INSERT ON products
    FOR EACH ROW
    BEGIN
        UPDATE order_items
        SET price_at_time = NEW.price
        WHERE product_id = NEW.id;
    END;
');

        DB::unprepared('
    CREATE TRIGGER updating_priceattime_UPDATE_products
    AFTER UPDATE ON products
    FOR EACH ROW
    BEGIN
        UPDATE order_items
        SET price_at_time = NEW.price
        WHERE product_id = NEW.id;
    END;
');

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS updating_priceattime_UPDATE_products');
        DB::unprepared('DROP TRIGGER IF EXISTS updating_priceattime_INSERT_products');

    }
};
