import net from 'net';

const START_PORT = 4000;
const END_PORT = 5000;

export const getAvailablePort = async (start = START_PORT) => {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(start, () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                if (start >= END_PORT) {
                    reject(new Error('No available ports'));
                } else {
                    resolve(getAvailablePort(start + 1));
                }
            } else {
                reject(err);
            }
        });
    });
};
