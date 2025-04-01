import { Director } from "../entities/Director";

export interface DirectorRepository {
  findById(id: string): Promise<Director | null>;
  create(director: Partial<Director>): Promise<Director>;
  delete(id: string): Promise<boolean>;
}
