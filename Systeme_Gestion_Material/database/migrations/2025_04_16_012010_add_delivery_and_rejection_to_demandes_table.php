<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->date('delivery_date')->nullable();
            $table->text('rejection_reason')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropColumn('delivery_date');
            $table->dropColumn('rejection_reason');
        });
    }
    

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    
};
