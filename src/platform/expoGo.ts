import Constants, { ExecutionEnvironment } from "expo-constants";

/** Expo Go não traz o mapa nativo; nele o app mostra a lista no lugar do mapa. */
export const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
