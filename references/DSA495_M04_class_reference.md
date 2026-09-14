# DSA 495 Module 4 class reference

This project has a related course reference from **DSA 495, Module 4: Zero-Shot and Few-Shot Classification**.

The class activity uses **Flan-T5-base** for zero-shot and few-shot text classification on a four-class subset of BANKING77, then evaluates predictions against held-out reference labels using accuracy, precision, recall, macro-F1, class reports, and confusion matrices. The lesson also notes **natural language inference (NLI) zero-shot classification** as an alternative mechanism and gives `facebook/bart-large-mnli` as an example, which is relevant to the classifier used in this Iran rhetoric project.

## Topics worth revisiting

- Zero-shot classification: category definitions are supplied, but no labeled examples are shown to the model.
- Few-shot classification: labeled demonstrations are included in the prompt while model weights remain fixed.
- Development vs. evaluation data and why prompt changes should be made on development data rather than the final holdout.
- Precision, recall, F1, macro-F1, classification reports, and confusion matrices.
- Comparing zero-shot and few-shot settings using the same held-out reference set.
- NLI-based zero-shot classification as another approach to text classification.

## Local course materials

Files from the September 14, 2026 class materials were saved locally as:

- `DSA495_M04_Zero_Shot_Few_Shot_Classification.ipynb`
- `M04_Classification02` data package, including BANKING77 examples, development, and evaluation CSVs

These class files are not copied into this public repository; this note is only here so the material can be located and reused as a methodological reference later.

## Sources named in the class notebook

- Google, **Flan-T5-base** model card: https://huggingface.co/google/flan-t5-base
- Hugging Face, **Zero-Shot Classification / NLI** task documentation: https://huggingface.co/tasks/zero-shot-classification
- Hands-On Large Language Models, Chapter 4 companion notebook: https://github.com/handsOnLLM/Hands-On-Large-Language-Models/blob/main/chapter04/Chapter%204%20-%20Text%20Classification.ipynb
- BANKING77 / PolyAI, Casanueva et al. (2020), *Efficient Intent Detection with Dual Sentence Encoders*.

## Relationship to this project

This class material was not used as a source for the Iran findings. It is a later methodological reference for evaluating and comparing text classifiers. The current project uses `facebook/bart-large-mnli` as a multi-label zero-shot classifier for rhetorical frames.
