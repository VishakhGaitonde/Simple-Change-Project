
import { useState } from "react";

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

const money = (n) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

function getCombinations(amount) {
  if (amount === 0) return [[]];

  const results = [];

  function search(index, remaining, notes) {
    if (results.length >= 1500) return;

    if (remaining === 0) {
      results.push([...notes]);
      return;
    }

    if (index === DENOMINATIONS.length) return;

    const denomination = DENOMINATIONS[index];
    const maxCount = Math.floor(remaining / denomination);

    for (let count = maxCount; count >= 0; count--) {
      if (results.length >= 1500) return;

      for (let i = 0; i < count; i++) {
        notes.push(denomination);
      }

      search(index + 1, remaining - count * denomination, notes);

      notes.length -= count;
    }
  }

  search(0, amount, []);

  results.sort((a, b) => a.length - b.length);

  const unique = [];
  const seen = new Set();

  for (const combo of results) {
    const key = combo.join(",");
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(combo);
    }
  }

  // Prefer different-looking combinations, not just the
  // three shortest variations of the same combination.
  const selected = [];
  const signatures = [];

  for (const combo of unique) {
    const signature = DENOMINATIONS.map(
      (d) => combo.filter((n) => n === d).length
    );

    const diverse = signatures.every(
      (old) =>
        signature.reduce(
          (sum, count, i) => sum + Math.abs(count - old[i]),
          0
        ) >= 2
    );

    if (selected.length === 0 || diverse) {
      selected.push(combo);
      signatures.push(signature);
    }

    if (selected.length === 3) break;
  }

  for (const combo of unique) {
    if (selected.length === 3) break;
    if (!selected.some((item) => item.join(",") === combo.join(","))) {
      selected.push(combo);
    }
  }

  return selected;
}

function App() {
  const [bill, setBill] = useState("");
  const [received, setReceived] = useState("");
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  const billAmount = bill === "" ? null : Number(bill);
  const cashReceived = received === "" ? null : Number(received);

  const valid =
    billAmount !== null &&
    cashReceived !== null &&
    bill.trim() !== "" &&
    received.trim() !== "" &&
    Number.isSafeInteger(billAmount) &&
    Number.isSafeInteger(cashReceived) &&
    billAmount >= 0 &&
    cashReceived >= 0 &&
    billAmount <= 100000 &&
    cashReceived <= 100000;

  const shortfall =
    valid && cashReceived < billAmount
      ? billAmount - cashReceived
      : 0;

  const change =
    valid && cashReceived >= billAmount
      ? cashReceived - billAmount
      : 0;

  const combinations =
    valid && cashReceived >= billAmount
      ? getCombinations(change)
      : [];

  function finishTransaction() {
    if (!valid) {
      setError("Enter valid whole-rupee amounts first.");
      return;
    }

    if (cashReceived < billAmount) {
      setError("The customer has not paid the full amount.");
      return;
    }

    setCompleted(true);
    setError("");
  }

  function nextTransaction() {
    setBill("");
    setReceived("");
    setCompleted(false);
    setError("");
  }

  const styles = `
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f5f5f0;
      color: #20352d;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system,
        BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    button, input { font: inherit; }
    button { cursor: pointer; }
    .app {
      min-height: 100vh;
      padding: 34px 18px 48px;
      background:
        radial-gradient(ellipse at 8% 5%, #e7eee2 0, transparent 35%),
        #f5f5f0;
    }
    .shell { max-width: 850px; margin: 0 auto; }
    .topbar {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 36px; gap: 12px;
    }
    .brand { display: flex; gap: 12px; align-items: center; }
    .logo {
      width: 48px; height: 48px; border-radius: 16px;
      background: #244b3b; color: #f5dba6;
      display: grid; place-items: center; font-size: 25px;
    }
    .brand h1 { font-size: 23px; margin: 0; letter-spacing: -1px; }
    .brand p { margin: 3px 0 0; font-size: 12px; color: #7d8980; }
    .pill {
      padding: 9px 13px; border-radius: 30px;
      background: white; border: 1px solid #e4e8df;
      color: #506458; font-size: 12px; font-weight: 650;
    }
    .intro { margin-bottom: 25px; }
    .eyebrow {
      text-transform: uppercase; letter-spacing: 2px;
      color: #7d8b78; font-size: 10px; font-weight: 800;
    }
    .intro h2 {
      font-size: clamp(28px, 5vw, 39px); letter-spacing: -1.7px;
      line-height: 1.15; margin: 10px 0;
    }
    .intro p { color: #78837b; margin: 0; font-size: 14px; line-height: 1.7; }
    .card {
      background: #fff; border: 1px solid #e9ece5;
      border-radius: 22px; padding: 25px; margin-bottom: 17px;
      box-shadow: 0 8px 30px #263c2810;
    }
    .section-head {
      display: flex; justify-content: space-between;
      align-items: center; gap: 10px; margin-bottom: 23px;
    }
    .section-head h3 { margin: 0; font-size: 16px; }
    .step {
      width: 29px; height: 29px; display: grid; place-items: center;
      border-radius: 10px; background: #edf2e9;
      color: #345a43; font-size: 12px; font-weight: 800;
    }
    .fields {
      display: grid;
      grid-template-columns: 1fr;
      gap: 19px;
    }
    .field label {
      display: block; font-size: 12px; font-weight: 650;
      color: #68766c; margin-bottom: 9px;
    }
    .input-wrap { position: relative; }
    .currency {
      position: absolute; left: 15px; top: 50%;
      transform: translateY(-50%); color: #87948a;
      font-size: 20px; font-weight: 600;
    }
    .field input {
      width: 100%; padding: 17px 12px 17px 42px;
      border: 1px solid #e0e6dc; border-radius: 13px;
      outline: none; color: #233d30; background: #fbfcf9;
      font-size: 22px; font-weight: 750;
      transition: border-color .2s, box-shadow .2s;
    }
    .field input:focus {
      border-color: #527e60; box-shadow: 0 0 0 3px #527e6018;
    }
    .field input::placeholder { color: #c4cbc2; }
    .helper { font-size: 11px; color: #9aa39b; margin-top: 9px; }
    .result {
      border-radius: 19px; background: #214636;
      color: white; padding: 25px;
      position: relative; overflow: hidden;
    }
    .result:after {
      content: "₹"; position: absolute; right: 18px; top: -32px;
      font-size: 170px; line-height: 1; font-weight: 800;
      color: #ffffff09; pointer-events: none;
    }
    .result .label { font-size: 12px; color: #c4d6c9; }
    .result .amount {
      font-size: clamp(38px, 8vw, 53px); font-weight: 800;
      letter-spacing: -2px; margin: 9px 0 5px;
    }
    .result .sub { font-size: 12px; color: #c4d6c9; }
    .result-top {
      display: flex; justify-content: space-between;
      align-items: center; gap: 10px;
    }
    .status {
      border-radius: 30px; background: #ffffff19;
      padding: 8px 11px; font-size: 11px; white-space: nowrap;
    }
    .warning { background: #fff1dc; color: #945a15; }
    .warning .label, .warning .sub { color: #945a15; }
    .warning:after { color: #945a150a; }
    .combo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .combo {
      border: 1px solid #e6eae2; border-radius: 15px;
      padding: 15px 13px; min-width: 0;
      background: #fcfdfa;
    }
    .combo .num { font-size: 10px; color: #879287; font-weight: 750; }
    .combo .combo-total { font-size: 19px; font-weight: 800; margin: 7px 0 12px; }
    .notes { display: flex; flex-wrap: wrap; gap: 6px; }
    .note {
      background: #eaf0e6; color: #34523c;
      border-radius: 7px; padding: 6px 8px;
      font-size: 11px; font-weight: 750; white-space: nowrap;
    }
    .empty {
      padding: 24px; border: 1px dashed #dce3d8;
      border-radius: 14px; text-align: center;
      color: #879287; font-size: 13px;
    }
    .actions { display: flex; gap: 10px; margin-top: 20px; }
    .primary, .secondary {
      border: 0; border-radius: 13px; padding: 15px 18px;
      font-weight: 750; font-size: 13px;
    }
    .primary {
      flex: 1; color: white; background: #244b3b;
      transition: background .2s, transform .2s;
    }
    .primary:hover { background: #306149; transform: translateY(-1px); }
    .primary:disabled { opacity: .4; cursor: not-allowed; transform: none; }
    .secondary { background: #edf1e9; color: #3c5945; }
    .error { color: #b44c36; font-size: 12px; margin-top: 13px; }
    .success {
      text-align: center; padding: 22px 10px 6px;
    }
    .success-icon {
      width: 60px; height: 60px; margin: 0 auto 16px;
      display: grid; place-items: center; border-radius: 50%;
      background: #e4f2e4; color: #2e7048; font-size: 28px;
    }
    .success h3 { font-size: 24px; margin: 0 0 8px; }
    .success p { color: #77847a; font-size: 13px; line-height: 1.6; }
    .footer { text-align: center; color: #9aa399; font-size: 11px; padding-top: 18px; }
    @media(max-width: 600px) {
      .app { padding: 22px 13px 35px; }
      .topbar { margin-bottom: 29px; }
      .card { padding: 19px; border-radius: 18px; }
      .combo-grid { grid-template-columns: 1fr; }
      .combo { padding: 14px; }
      .combo .combo-total { margin-bottom: 9px; }
      .result { padding: 21px; }
      .pill { font-size: 10px; }
    }
  `;

  return (
    <div className="app">
      <style>{styles}</style>
      <main className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="logo">₹</div>
            <div>
              <h1>khulla<span style={{ color: "#79916e" }}>.</span></h1>
              <p>Smart change, made simple.</p>
            </div>
          </div>
          <div className="pill">● &nbsp; INDIA · INR</div>
        </header>

        <section className="intro">
          <div className="eyebrow">Your everyday cash companion</div>
          <h2>Every rupee,<br />right where it belongs.</h2>
          <p>Enter the bill, count the cash, and get the right change.</p>
        </section>

        {completed ? (
          <section className="card success">
            <div className="success-icon">✓</div>
            <h3>Transaction complete!</h3>
            <p>
              Payment of {money(cashReceived)} received for a bill of{" "}
              {money(billAmount)}.
              <br />
              {change === 0
                ? "Exact payment. No change needed."
                : `${money(change)} change returned to the customer.`}
            </p>
            <div className="actions">
              <button className="primary" onClick={nextTransaction}>
                + &nbsp; New transaction
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="card">
              <div className="section-head">
                <h3>Payment details</h3>
                <span className="step">01</span>
              </div>

              <div className="fields">
                <div className="field">
                  <label htmlFor="received">Cash received</label>
                  <div className="input-wrap">
                    <span className="currency">₹</span>
                    <input
                      id="received"
                      type="number"
                      min="0"
                      max="100000"
                      step="1"
                      placeholder="0"
                      value={received}
                      onChange={(e) => {
                        setReceived(e.target.value);
                        setError("");
                      }}
                    />
                  </div>
                  <div className="helper">Amount handed by customer</div>
                </div>

                <div className="field">
                  <label htmlFor="bill">Amount to be paid</label>
                  <div className="input-wrap">
                    <span className="currency">₹</span>
                    <input
                      id="bill"
                      type="number"
                      min="0"
                      max="100000"
                      step="1"
                      placeholder="0"
                      value={bill}
                      onChange={(e) => {
                        setBill(e.target.value);
                        setError("");
                      }}
                    />
                  </div>
                  <div className="helper">Total bill amount</div>
                </div>
              </div>
            </section>

            <section
              className={`result ${shortfall > 0 ? "warning" : ""}`}
              aria-live="polite"
            >
              <div className="result-top">
                <span className="label">
                  {shortfall > 0 ? "Amount still due" : "Change to return"}
                </span>
                <span className="status">
                  {!valid
                    ? "Awaiting payment"
                    : shortfall > 0
                    ? "Insufficient payment"
                    : change === 0
                    ? "Exact payment ✓"
                    : "Ready to return"}
                </span>
              </div>
              <div className="amount">
                {valid
                  ? money(shortfall > 0 ? shortfall : change)
                  : "₹—"}
              </div>
              <div className="sub">
                {!valid
                  ? "Enter both amounts to calculate"
                  : shortfall > 0
                  ? "Collect the remaining amount before completing."
                  : change === 0
                  ? "Perfect! No change required."
                  : "Give this amount back to the customer."}
              </div>
            </section>

            <section className="card" style={{ marginTop: 17 }}>
              <div className="section-head">
                <h3>How to give the change</h3>
                <span className="step">02</span>
              </div>

              {valid && cashReceived >= billAmount && change > 0 ? (
                <>
                  <p style={{
                    color: "#859087", fontSize: 12, marginTop: -11,
                    marginBottom: 19, lineHeight: 1.6
                  }}>
                    Choose any combination that adds up to{" "}
                    <strong style={{ color: "#34523c" }}>{money(change)}</strong>.
                  </p>
                  <div className="combo-grid">
                    {combinations.map((combo, i) => (
                      <div className="combo" key={combo.join(",")}>
                        <div className="num">OPTION 0{i + 1}</div>
                        <div className="combo-total">{money(change)}</div>
                        <div className="notes">
                          {combo.map((note, j) => (
                            <span className="note" key={`${note}-${j}`}>
                              ₹{note}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty">
                  {valid && change === 0 && shortfall === 0
                    ? "Exact payment — you don't need to return any change."
                    : shortfall > 0
                    ? "Collect the remaining payment to calculate change."
                    : "Your change combinations will appear here."}
                </div>
              )}

              {error && <div className="error">{error}</div>}

              <div className="actions">
                <button
                  className="primary"
                  disabled={!valid || shortfall > 0}
                  onClick={finishTransaction}
                >
                  ✓ &nbsp; End transaction
                </button>
                <button className="secondary" onClick={nextTransaction}>
                  Clear
                </button>
              </div>
            </section>
          </>
        )}

        <footer className="footer">
          Made for everyday business in India · Khulla © 2026
        </footer>
      </main>
    </div>
  );
}

export default App;