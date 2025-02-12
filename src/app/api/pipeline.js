import { pipeline } from "@xenova/transformers";

class PipelineSingleton {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

let PipelineSingletonInstance;

if (process.env.NODE_ENV !== 'production') {
  // When running in development mode, attach the pipeline to the
  // global object so that it's preserved between hot reloads.
  // For more information, see https://vercel.com/guides/nextjs-prisma-postgres
  if (!global.PipelineSingleton) {
    global.PipelineSingleton = PipelineSingleton;
  }
  PipelineSingletonInstance = global.PipelineSingleton;
} else {
  PipelineSingletonInstance = PipelineSingleton;
}

export default PipelineSingletonInstance;