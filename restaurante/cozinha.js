const amqp = require('amqplib');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function iniciarCozinha() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        const exchange = 'pedidos_exchange';
        await channel.assertExchange(exchange, 'fanout', { durable: true });

        const queue = 'fila_cozinha';
        await channel.assertQueue(queue, { durable: true });
        // Liga a fila à exchange
        await channel.bindQueue(queue, exchange, '');

        console.log("👨‍🍳 [Cozinha] Aguardando pedidos...");
        channel.prefetch(1); // Processa um pedido por vez

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const pedido = JSON.parse(msg.content.toString());
                console.log(`[Cozinha] 🍳 Preparando Pedido #${pedido.pedido_id} (${pedido.item})...`);
                
                // Simula 3 segundos de preparo
                setTimeout(() => {
                    console.log(`[Cozinha] ✅ Pedido #${pedido.pedido_id} pronto!`);
                    channel.ack(msg);
                }, 3000);
            }
        });
    } catch (error) {
        console.error("Erro na Cozinha:", error);
        // Tenta reconectar em caso de falha (útil ao subir com Docker)
        setTimeout(iniciarCozinha, 5000); 
    }
}
iniciarCozinha();