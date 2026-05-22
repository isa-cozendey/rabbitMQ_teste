const amqp = require('amqplib');

// Conecta no localhost, pois este script vai rodar fora do Docker
const RABBITMQ_URL = 'amqp://localhost'; 

async function enviarPedido(pedidoId, item, mesa) {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        const exchange = 'pedidos_exchange';
        // Garante que a exchange existe
        await channel.assertExchange(exchange, 'fanout', { durable: true });

        const pedido = { pedido_id: pedidoId, item: item, mesa: mesa };

        // Publica a mensagem
        channel.publish(exchange, '', Buffer.from(JSON.stringify(pedido)));
        console.log(`📱 [App] Pedido #${pedidoId} enviado: ${item} (Mesa ${mesa})`);

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);

    } catch (error) {
        console.error("Erro no Produtor:", error);
    }
}

// Pega o ID via argumento do terminal ou gera um aleatório
const id = process.argv[2] || Math.floor(Math.random() * 1000);
enviarPedido(id, "Hambúrguer Duplo", 5);