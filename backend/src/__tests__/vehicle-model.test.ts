// backend/src/__tests__/vehicle-model.test.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Vehicle, { IVehicle } from '../models/Vehicle';

describe('Vehicle Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Vehicle.deleteMany({});
  });

  const validVehicleData = {
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 25000,
    year: 2024,
    quantity: 5,
    description: 'A reliable mid-size sedan',
  };

  it('should create a vehicle with all valid fields', async () => {
    const vehicle = await Vehicle.create(validVehicleData);

    expect(vehicle.make).toBe('Toyota');
    expect(vehicle.model).toBe('Camry');
    expect(vehicle.category).toBe('Sedan');
    expect(vehicle.price).toBe(25000);
    expect(vehicle.year).toBe(2024);
    expect(vehicle.quantity).toBe(5);
    expect(vehicle.description).toBe('A reliable mid-size sedan');
    expect(vehicle._id).toBeDefined();
    expect(vehicle.createdAt).toBeDefined();
  });

  it('should default quantity to 1 if not provided', async () => {
    const { quantity, ...dataWithoutQuantity } = validVehicleData;
    const vehicle = await Vehicle.create(dataWithoutQuantity);

    expect(vehicle.quantity).toBe(1);
  });

  it('should allow description to be optional', async () => {
    const { description, ...dataWithoutDescription } = validVehicleData;
    const vehicle = await Vehicle.create(dataWithoutDescription);

    expect(vehicle.description).toBeUndefined();
  });

  it('should require make field', async () => {
    const { make, ...data } = validVehicleData;
    const vehicle = new Vehicle(data);
    const error = vehicle.validateSync();

    expect(error).toBeDefined();
    expect(error!.errors.make).toBeDefined();
  });

  it('should require model field', async () => {
    const { model, ...data } = validVehicleData;
    const vehicle = new Vehicle(data);
    const error = vehicle.validateSync();

    expect(error).toBeDefined();
    expect(error!.errors.model).toBeDefined();
  });

  it('should require category field', async () => {
    const { category, ...data } = validVehicleData;
    const vehicle = new Vehicle(data);
    const error = vehicle.validateSync();

    expect(error).toBeDefined();
    expect(error!.errors.category).toBeDefined();
  });

  it('should require price field', async () => {
    const { price, ...data } = validVehicleData;
    const vehicle = new Vehicle(data);
    const error = vehicle.validateSync();

    expect(error).toBeDefined();
    expect(error!.errors.price).toBeDefined();
  });

  it('should require year field', async () => {
    const { year, ...data } = validVehicleData;
    const vehicle = new Vehicle(data);
    const error = vehicle.validateSync();

    expect(error).toBeDefined();
    expect(error!.errors.year).toBeDefined();
  });

  it('should reject negative price', async () => {
    const vehicle = new Vehicle({ ...validVehicleData, price: -100 });
    const error = vehicle.validateSync();

    expect(error).toBeDefined();
    expect(error!.errors.price).toBeDefined();
  });

  it('should reject negative quantity', async () => {
    const vehicle = new Vehicle({ ...validVehicleData, quantity: -1 });
    const error = vehicle.validateSync();

    expect(error).toBeDefined();
    expect(error!.errors.quantity).toBeDefined();
  });

  it('should accept zero price', async () => {
    const vehicle = new Vehicle({ ...validVehicleData, price: 0 });
    const error = vehicle.validateSync();

    expect(error).toBeUndefined();
  });

  it('should accept zero quantity', async () => {
    const vehicle = new Vehicle({ ...validVehicleData, quantity: 0 });
    const error = vehicle.validateSync();

    expect(error).toBeUndefined();
  });

  it('should accept valid category values', async () => {
    const categories = ['Sedan', 'SUV', 'Truck', 'Electric', 'Coupe', 'Hatchback'];

    for (const category of categories) {
      const vehicle = await Vehicle.create({
        ...validVehicleData,
        category,
        make: `Make-${category}`,
      });
      expect(vehicle.category).toBe(category);
    }
  });

  it('should trim whitespace from make and model', async () => {
    const vehicle = await Vehicle.create({
      ...validVehicleData,
      make: '  Toyota  ',
      model: '  Camry  ',
    });

    expect(vehicle.make).toBe('Toyota');
    expect(vehicle.model).toBe('Camry');
  });
});
