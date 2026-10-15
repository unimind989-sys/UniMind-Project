# Batch Leader flow review

This is the B09 review prototype for M38, M39, M40 and M68. Product implementation has not started. The repair register remains **51/75 locally verified, 24 remaining**.

Open the running [review page](http://127.0.0.1:3199/index.html). It includes English/Arabic, both themes, four screen sizes, doubled text and assignment-state examples.

1. Open the Anatomy campaign. Compare the personal deadline with the secondary campaign closing time.
2. Choose **Upload files**, then **Load sample files** beside the preview. Add descriptions, confirm permission and submit the three sample filenames.
3. Inspect a compact receipt. The two remaining corrections still lead the page.
4. Try **Fix information** and **Replace file**, then open a specific request from **Latest submissions**.
5. Use the decision form below the preview to approve the direction, request changes or hold this batch. Export the decision, then tell the agent that the form is complete.

One invented campaign exercises the requested flow with three missing files, two corrections, one processing record and one completed tracking example. Settings and other campaigns keep their existing implementation and are outside this prototype. Only the latest record per request appears; earlier versions are not an archive here.

The prototype creates sample receipts in document memory. It reads filenames and form input only: it does not read file contents, validate file signatures, upload, process, authenticate or grant access. The existing WP03-T05 contracts remain responsible for those behaviors. Reload clears sample work. Human decision fields start blank; agents must leave the shared review form untouched.

The review uses the existing supplied brand and font files, served through a loopback whitelist. To restart it in this workspace, run:

```powershell
corepack pnpm exec python 'E:\Unimind audits\flow audit\Merged\repairs\B09-leader-prototype\serve.py'
```

The server binds only `127.0.0.1:3199`. Its candidate fingerprint binds the six UI files and three existing assets. Source records and test evidence live beside that server script. Prototype approval covers the flow direction; implementation, final frontend acceptance and external delivery remain separate.
