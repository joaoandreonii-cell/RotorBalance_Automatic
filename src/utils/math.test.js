import { describe, it, expect } from "vitest";
import {
    computeResult,
    splitBetweenBlades,
    reductionPercent,
    qualityStatus,
} from "./math.js";

describe("computeResult (caracterização — exemplo do PPTX)", () => {
    it("resolve V0=8, V1=11.05, V2=3.82, V3=15.09, Mt=4.5", () => {
        const r = computeResult(8, 11.05, 3.82, 15.09, 4.5);
        expect(r.OP).toBeCloseTo(7.69, 2);
        expect(r.angle).toBeCloseTo(90.3, 1);
        expect(r.Mc).toBeCloseTo(4.68, 2);
    });

    it("retorna null quando OP ≈ 0 (vibrações iguais)", () => {
        expect(computeResult(8, 8, 8, 8, 4.5)).toBeNull();
    });
});

describe("splitBetweenBlades", () => {
    it("divide entre pás adjacentes (6 pás, alvo 90°)", () => {
        const s = splitBetweenBlades(10, 90, 6, 0);
        // pás em 0,60,120,...; alvo 90° fica entre pá 2 (60°) e pá 3 (120°)
        expect(s.bladeA).toBe(2);
        expect(s.bladeB).toBe(3);
        expect(s.angleA).toBe(60);
        expect(s.angleB).toBe(120);
        // simetria: massas iguais
        expect(s.massA).toBeCloseTo(s.massB, 6);
        // recomposição vetorial devolve o vetor original
        const rad = (d) => (d * Math.PI) / 180;
        const x = s.massA * Math.sin(rad(s.angleA)) + s.massB * Math.sin(rad(s.angleB));
        const y = s.massA * Math.cos(rad(s.angleA)) + s.massB * Math.cos(rad(s.angleB));
        expect(Math.sqrt(x * x + y * y)).toBeCloseTo(10, 6);
        expect((Math.atan2(x, y) * 180) / Math.PI).toBeCloseTo(90, 6);
    });

    it("alvo exatamente numa pá → 100% nela", () => {
        const s = splitBetweenBlades(10, 120, 6, 0);
        expect(s.massA).toBeCloseTo(10, 6);
        expect(s.massB).toBeCloseTo(0, 6);
        expect(s.angleA).toBe(120);
    });

    it("respeita o offset da pá 1", () => {
        const s = splitBetweenBlades(10, 90, 4, 30);
        // pás em 30,120,210,300 → alvo 90 entre pá 1 (30°) e pá 2 (120°)
        expect(s.angleA).toBe(30);
        expect(s.angleB).toBe(120);
    });

    it("retorna null para menos de 3 pás ou entradas inválidas", () => {
        expect(splitBetweenBlades(10, 90, 2, 0)).toBeNull();
        expect(splitBetweenBlades(0, 90, 6, 0)).toBeNull();
        expect(splitBetweenBlades(10, 90, null, 0)).toBeNull();
    });
});

describe("verificação pós-balanceamento", () => {
    it("calcula % de redução", () => {
        expect(reductionPercent(8, 0.8)).toBeCloseTo(90, 6);
        expect(reductionPercent(8, 4)).toBeCloseTo(50, 6);
        expect(reductionPercent(8, 10)).toBeCloseTo(-25, 6);
    });

    it("classifica o status", () => {
        expect(qualityStatus(95)).toEqual({ key: "excellent", label: "Excelente", tone: "ok" });
        expect(qualityStatus(90)).toEqual({ key: "excellent", label: "Excelente", tone: "ok" });
        expect(qualityStatus(75)).toEqual({ key: "good", label: "Bom", tone: "ok" });
        expect(qualityStatus(60)).toEqual({ key: "acceptable", label: "Aceitável", tone: "warn" });
        expect(qualityStatus(20)).toEqual({ key: "redo", label: "Refazer", tone: "critical" });
    });
});
