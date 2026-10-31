import { testSuite as fasta } from './fasta.test.js';
import { testSuite as orf } from './orf.test.js';
import { testSuite as alignment } from './alignment.test.js';
import { testSuite as restriction } from './restriction.test.js';
import { testSuite as tm } from './tm.test.js';

export const ALL_TESTS = [...fasta, ...orf, ...alignment, ...restriction, ...tm];

export function runSuite() {
    const results = [];
    const t0 = performance.now();

    ALL_TESTS.forEach((test, i) => {
        try {
            const r = test.fn();
            results.push({
                ...test,
                pass: r.pass,
                detail: r.detail,
                error: null,
                idx: i + 1
            });
        } catch (err) {
            results.push({
                ...test,
                pass: false,
                detail: 'Exception',
                error: err.message,
                idx: i + 1
            });
        }
    });

    return {
        results,
        passed: results.filter(r => r.pass).length,
        failed: results.filter(r => !r.pass).length,
        elapsed: (performance.now() - t0).toFixed(2),
        total: results.length
    };
}