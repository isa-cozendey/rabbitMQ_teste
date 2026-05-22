const amqp = require('amqplib');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function iniciarPagamento() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        const exchange = 'pedidos_exchange';
        await channel.assertExchange(exchange, 'fanout', { durable: true });

        const queue = 'fila_pagamento';
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, '');

        console.log("💳 [Financeiro] Aguardando cobranças...");
        channel.prefetch(1);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const pedido = JSON.parse(msg.content.toString());
                console.log(`[Financeiro] 🔄 Processando cobrança #${pedido.pedido_id}...`);
                
                // Simula 1 segundo de processamento
                setTimeout(() => {
                    console.log(`[Financeiro] 💰 Pagamento #${pedido.pedido_id} aprovado!`);
                    channel.ack(msg);
                }, 1000);
            }
        });
    } catch (error) {
        console.error("Erro no Financeiro:", error);
        setTimeout(iniciarPagamento, 5000);
    }
}
iniciarPagamento();