<?php

// database/migrations/[timestamp]_add_columns_to_material_requests_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('material_requests', function (Blueprint $table) {
            $table->date('delivery_date')->nullable()->after('status');
            $table->text('rejection_reason')->nullable()->after('delivery_date');
        });
    }

    public function down()
    {
        Schema::table('material_requests', function (Blueprint $table) {
            $table->dropColumn(['delivery_date', 'rejection_reason']);
        });
    }
};
