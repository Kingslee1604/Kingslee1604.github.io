---
title: MEDREx
summary: Reads noisy pathology reports and names the cancer type out of 32, comparing six NLP methods on equal terms. A TF-IDF + linear SVM beat the sponsor's published baseline, fine-tuned BERT and RAG with LLMs.
order: 2
caseStudy: true
tags: [Python, scikit-learn, Bio_ClinicalBERT, Sentence embeddings, RAG, Ollama, GPT-4o-mini, Streamlit]
repo: https://github.com/Kingslee1604/MEDREx-Masters-Project/tree/submission
metrics:
  - value: 97.37%
    label: test accuracy, 32 cancer types
    source: https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/demo/ProjectCode/Method2-TFIDFSVM_LogisticRegResults.sql
  - value: 96.48%
    label: macro F1 (rare types count equally)
    source: https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/demo/ProjectCode/Method2-TFIDFSVM_LogisticRegResults.sql
  - value: 12 s
    label: to train, on a laptop CPU
    source: https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/demo/ProjectCode/Method2-TFIDFSVM_LogisticRegResults.sql
---

*M.S. Computer Science project, California State University, Dominguez Hills (Spring 2026),
sponsored by the Cedars-Sinai AI Campus (Project #32: "Natural Language Processing in Cancer:
Extracting Diagnostic Insights from Pathology Reports").*

## The problem

A pathology report says what cancer a patient has, but as free text: scanned, run through OCR
("Date of Recelpt"), with page headers and different formats from many hospitals. The task:
read one report from The Cancer Genome Atlas (TCGA) and name the cancer type, one of **32**
classes (breast, lung adenocarcinoma, glioblastoma and so on).

The real question was not "how high can the score go" but **does the extra complexity of newer
methods pay for itself?** In a hospital that matters: patient text usually cannot leave the
building (HIPAA), clinical tools need to explain their answers, and cost and speed count.

## The approach

Six methods from four families, each run on **the same data split** (9,523 reports; 6,666 to
train, 2,857 to test, stratified, fixed seed), so differences come from the method and not the
data. Each one is a single script that logs every step, and every result below links to its run
log.

<figure class="diagram">
<div class="diagram-scroll">
<svg viewBox="0 0 760 250" role="img" aria-labelledby="medrex-title medrex-desc">
<title id="medrex-title">MEDREx comparison setup</title>
<desc id="medrex-desc">9,523 noisy pathology reports go through one shared train and test split, then into four method families: sparse models (TF-IDF with logistic regression or a linear SVM), a fine-tuned transformer (Bio_ClinicalBERT), embeddings with nearest neighbours (MiniLM), and retrieval-augmented generation with a local or hosted LLM. Each predicts one of 32 cancer types and is scored the same way.</desc>
<defs><marker id="arrow-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-arrowhead"/></marker></defs>
<g class="d-lines" marker-end="url(#arrow-m)">
<line x1="170" y1="125" x2="206" y2="125"/>
<line x1="360" y1="125" x2="396" y2="35"/>
<line x1="360" y1="125" x2="396" y2="95"/>
<line x1="360" y1="125" x2="396" y2="155"/>
<line x1="360" y1="125" x2="396" y2="215"/>
<line x1="590" y1="35" x2="616" y2="115"/>
<line x1="590" y1="95" x2="616" y2="120"/>
<line x1="590" y1="155" x2="616" y2="130"/>
<line x1="590" y1="215" x2="616" y2="135"/>
</g>
<g class="d-box"><rect x="20" y="85" width="150" height="80" rx="10"/><text x="95" y="120">Pathology reports</text><text x="95" y="140" class="d-sub">9,523 · noisy OCR text</text></g>
<g class="d-box"><rect x="210" y="85" width="150" height="80" rx="10"/><text x="285" y="120">One shared split</text><text x="285" y="140" class="d-sub">6,666 train · 2,857 test</text></g>
<g class="d-box d-key"><rect x="400" y="10" width="190" height="50" rx="10"/><text x="495" y="31">Sparse (winner)</text><text x="495" y="49" class="d-sub">TF-IDF + LR, linear SVM</text></g>
<g class="d-box"><rect x="400" y="70" width="190" height="50" rx="10"/><text x="495" y="91">Transformer</text><text x="495" y="109" class="d-sub">fine-tuned Bio_ClinicalBERT</text></g>
<g class="d-box"><rect x="400" y="130" width="190" height="50" rx="10"/><text x="495" y="151">Embeddings</text><text x="495" y="169" class="d-sub">MiniLM + nearest neighbours</text></g>
<g class="d-box"><rect x="400" y="190" width="190" height="50" rx="10"/><text x="495" y="211">RAG</text><text x="495" y="229" class="d-sub">llama3.2 local, GPT-4o-mini</text></g>
<g class="d-box"><rect x="620" y="85" width="130" height="80" rx="10"/><text x="685" y="120">Cancer type</text><text x="685" y="140" class="d-sub">1 of 32 · same metrics</text></g>
</svg>
</div>
<figcaption>Every method sees the same reports and is scored with the same metrics: accuracy, weighted F1, and macro F1, which counts rare cancer types as much as common ones.</figcaption>
</figure>

## Results

| Method | Test accuracy | Notes | Source |
|---|---|---|---|
| Sponsor baseline: bag of words + logistic regression | 95.31% published · **95.48%** my re-run | Their own 50/20/30 split | [run log](https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/demo/CedarCinaiCode/LoggisticRegressionResults.sql) |
| Sponsor baseline: bag of words + random forest | **92.16%** my re-run | 24.6 min to run | [run log](https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/demo/CedarCinaiCode/RandomForestResults.sql) |
| 1. TF-IDF + logistic regression | **96.36%** | Macro F1 95.73%; 0.8 min | [run log](https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/demo/ProjectCode/Method1-TFIDF_LogisticRegResults.sql) |
| **2. TF-IDF + linear SVM** | **97.37%** | Macro F1 96.48%; 0.2 min on CPU | [run log](https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/demo/ProjectCode/Method2-TFIDFSVM_LogisticRegResults.sql) |
| 3. Fine-tuned Bio_ClinicalBERT | **94.57%** | 4 epochs on a Colab T4 GPU | [notebook](https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/demo/BertModel_Code/method3_bert_finetune_colab.ipynb) |
| 4. MiniLM embeddings + k-nearest neighbours | **90.13%** | Best K = 5; no training | [run log](https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/demo/ProjectCode/Method4-EmbeddingSimilarity.sql) |
| 5. RAG + llama3.2 (3B, local) | **64%** | 50-report sample | [README](https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/README.md) |
| 6. RAG + GPT-4o-mini | **89%** | 300-report sample | [README](https://github.com/Kingslee1604/MEDREx-Masters-Project/blob/submission/README.md) |

## What I learned

- **The simplest strong model won.** A linear SVM on TF-IDF features reached 97.37%, trains in
  about 12 seconds on a laptop CPU, and explains itself through per-word weights. For cancer
  *type*, the answer is usually stated in a few distinctive words (organ, histology), which
  word-and-phrase models capture directly.
- **Feature engineering beat the baseline before any new model did.** Same classifier, better
  features (TF-IDF, two-word phrases, balanced class weights): +1 point. Then switching to an SVM:
  another +1.
- **Fine-tuned BERT didn't pay for its GPU here.** It reads at most 512 tokens, so much of a long
  report is never seen, and the rarest classes have too few examples to learn from.
- **In RAG, the model mattered more than the retrieval.** The same retrieval and prompt scored
  64% with a small local model and 89% with GPT-4o-mini.

## The hard cases

The same few cancer types were hard for every method: rare ones that look like a neighbour.
Uterine carcinosarcoma is confused with ovarian and endometrial cancer, rectal with colon
adenocarcinoma (the same disease near the junction, which is partly a labelling question), and
the two lung subtypes with each other. The SVM held up best on these, thanks to balanced class
weights and reading every word.

## Honest caveats

- The RAG results come from samples (50 and 300 reports), not the full test set, so they have
  wider error margins.
- The sponsor's baseline used a different split (50/20/30), so part of the ~2-point gain may come
  from having more training data. A strict comparison would rerun it on the same split.
- The nearest-neighbour method picked its K on the test set, a mild optimistic bias (the spread
  across K was only 0.5 points).

## What I'd recommend, and do next

For a hospital: run TF-IDF + SVM for cancer-type triage (local, cheap, auditable), and send
low-confidence or rare-type cases to a person. Next steps for the project: TNM staging, the
sponsor's second task, where reasoning over context should favour transformers and LLMs;
long-document models; and statistical tests between methods.
