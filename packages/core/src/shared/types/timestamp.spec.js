"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timestamp_1 = require("./timestamp");
describe('Timestamp', () => {
    it('deve criar um Timestamp válido a partir de Date', () => {
        const date = new Date('2024-07-01T12:00:00Z');
        const ts = new timestamp_1.Timestamp(date);
        expect(ts.value.getTime()).toBe(date.getTime());
    });
    it('deve criar um Timestamp válido a partir de string ISO', () => {
        const iso = '2024-07-01T12:00:00Z';
        const ts = new timestamp_1.Timestamp(iso);
        expect(ts.value.getTime()).toBe(new Date(iso).getTime());
    });
    it('deve lançar erro para string inválida', () => {
        expect(() => new timestamp_1.Timestamp('data-invalida')).toThrow(timestamp_1.InvalidTimestampError);
    });
    it('deve lançar erro para Date inválida', () => {
        expect(() => new timestamp_1.Timestamp(new Date('data-invalida'))).toThrow(timestamp_1.InvalidTimestampError);
    });
    it('deve comparar igualdade corretamente', () => {
        const date = new Date('2024-07-01T12:00:00Z');
        const ts1 = new timestamp_1.Timestamp(date);
        const ts2 = new timestamp_1.Timestamp('2024-07-01T12:00:00Z');
        expect(ts1.equals(ts2)).toBe(true);
    });
    it('deve diferenciar Timestamps diferentes', () => {
        const ts1 = new timestamp_1.Timestamp('2024-07-01T12:00:00Z');
        const ts2 = new timestamp_1.Timestamp('2024-07-01T13:00:00Z');
        expect(ts1.equals(ts2)).toBe(false);
    });
});
//# sourceMappingURL=timestamp.spec.js.map