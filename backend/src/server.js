import { httpServer } from './app.js';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
  console.error('Prisma generate failed');
}

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
