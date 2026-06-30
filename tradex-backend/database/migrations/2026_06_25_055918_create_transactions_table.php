<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('transactions', function (Blueprint $table) {

        $table->id();

        $table->foreignId('user_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->string('stock_symbol', 20);

        $table->enum('transaction_type', ['BUY', 'SELL']);

        $table->unsignedInteger('quantity');

        $table->decimal('price_per_share', 15, 2);

        $table->decimal('total_value', 15, 2);

        $table->timestamp('executed_at');

        $table->timestamps();

        $table->index('stock_symbol');

        $table->index('transaction_type');

    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
