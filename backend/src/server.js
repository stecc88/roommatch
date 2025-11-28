import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
  console.error('Prisma generate failed');
}

const { httpServer } = await import('./app.js');

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
