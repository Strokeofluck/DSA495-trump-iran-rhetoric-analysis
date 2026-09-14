# DSA 495 Module 4 class reference

This project has a related course reference from **DSA 495, Module 4: Zero-Shot and Few-Shot Classification**.

The class activity uses **Flan-T5-base** for zero-shot and few-shot text classification on a four-class subset of BANKING77, then evaluates predictions against held-out reference labels using accuracy, precision, recall, macro-F1, class reports, and confusion matrices. The lesson also notes **natural language inference (NLI) zero-shot classification** as an alternative mechanism and gives `facebook/bart-large-mnli` as an example, which is relevant to the classifier used in this Iran rhetoric project.

## Public course source

The instructor's course materials are publicly available on GitHub:

- **Course repository:** https://github.com/SerenaYKim/DSA495-TextAnalysis
- **Module 4 notebook:** https://github.com/SerenaYKim/DSA495-TextAnalysis/blob/master/Module04/DSA495_M04_Zero_Shot_Few_Shot_Classification.ipynb

Use the public source above to retrieve the notebook later rather than storing a duplicate copy in this repository.

## Course data archive in Google Drive

The exact classroom data package used with the notebook is archived in Sean's Google Drive under **Text analysis for Data Science**:

- **Drive folder:** https://drive.google.com/drive/folders/1wdBDFH5hokeUJ_1xvTpiXbVBsvbEujIq
- **M04 data ZIP:** https://drive.google.com/file/d/19-hWmNJviQEQ3sMHOHKuQUsMdiqc6-y_/view?usp=drivesdk
- **ZIP filename:** `M04_Classification02-20260914T190252Z-1-001.zip`

The ZIP contains the files needed to reproduce the classroom exercise, including:

- `banking77_m04_examples_16.csv`
- `banking77_m04_development_72.csv`
- `banking77_m04_evaluation.csv`
- the BANKING77 license plus the underlying `train.csv` and `test.csv`

The Google Drive file is private/access-controlled even though this reference note is public.

## Topics worth revisiting

- Zero-shot classification: category definitions are supplied, but no labeled examples are shown to the model.
- Few-shot classification: labeled demonstrations are included in the prompt while model weights remain fixed.
- Development vs. evaluation data and why prompt changes should be made on development data rather than the final holdout.
- Precision, recall, F1, macro-F1, classification reports, and confusion matrices.
- Comparing zero-shot and few-shot settings using the same held-out reference set.
- NLI-based zero-shot classification as another approach to text classification.

## Local course materials

Files from the September 14, 2026 class materials were also saved locally as:

- `DSA495_M04_Zero_Shot_Few_Shot_Classification.ipynb`
- `M04_Classification02` data package, including BANKING77 examples, development, and evaluation CSVs

## Sources named in the class notebook

- Google, **Flan-T5-base** model card: https://huggingface.co/google/flan-t5-base
- Hugging Face, **Zero-Shot Classification / NLI** task documentation: https://huggingface.co/tasks/zero-shot-classification
- Hands-On Large Language Models, Chapter 4 companion notebook: https://github.com/handsOnLLM/Hands-On-Large-Language-Models/blob/main/chapter04/Chapter%204%20-%20Text%20Classification.ipynb
- BANKING77 / PolyAI, Casanueva et al. (2020), *Efficient Intent Detection with Dual Sentence Encoders*.

## Relationship to this project

This class material was not used as a source for the Iran findings. It is a later methodological reference for evaluating and comparing text classifiers. The current project uses `facebook/bart-large-mnli` as a multi-label zero-shot classifier for rhetorical frames.
