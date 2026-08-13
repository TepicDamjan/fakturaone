import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatIznos,
  formatIznosValuta,
  izracunajIznoseDokumenta,
  izracunajUkupanIznos,
  pdvPoStopama,
  zaokruziNovac,
} from "./format.ts";

describe("novčana matematika", () => {
  it("zaokružuje na 2 decimale", () => {
    assert.equal(zaokruziNovac(1.234), 1.23);
    assert.equal(zaokruziNovac(2.5), 2.5);
    assert.equal(zaokruziNovac(1.996), 2);
  });

  it("računa ukupno sa jednom PDV stopom", () => {
    const ukupno = izracunajUkupanIznos([{ kolicina: 2, cena: 100 }], 17, 10);
    assert.equal(ukupno, 224);
  });

  it("računa PDV po stavci (0% i 17%)", () => {
    const iznosi = izracunajIznoseDokumenta(
      [
        { kolicina: 1, cena: 100, pdvProcenat: 17 },
        { kolicina: 1, cena: 50, pdvProcenat: 0 },
      ],
      17,
      0
    );
    assert.equal(iznosi.osnovica, 150);
    assert.equal(iznosi.pdvIznos, 17);
    assert.equal(iznosi.ukupno, 167);
  });

  it("grupiše PDV po stopama", () => {
    const grupe = pdvPoStopama(
      [
        { kolicina: 1, cena: 100, pdvProcenat: 17 },
        { kolicina: 2, cena: 25, pdvProcenat: 0 },
      ],
      17
    );
    assert.deepEqual(grupe, [
      { stopa: 0, osnovica: 50, pdvIznos: 0 },
      { stopa: 17, osnovica: 100, pdvIznos: 17 },
    ]);
  });

  it("formatira iznos u bs stilu sa valutom", () => {
    assert.equal(formatIznos(1234.5), "1.234,50");
    assert.equal(formatIznosValuta(1234.5, "EUR"), "1.234,50 EUR");
  });

  it("kreditna nota sa negativnim cijenama", () => {
    const ukupno = izracunajUkupanIznos(
      [{ kolicina: 1, cena: -100, pdvProcenat: 17 }],
      17,
      -10
    );
    assert.equal(ukupno, -107);
  });
});
