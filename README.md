# RAYID
### AI-Assisted Digital Radiography Workflow Optimization System

RAYID is an intelligent software assistant designed to enhance the digital radiography workflow by supporting radiographers in patient positioning, exposure parameter optimization, anatomical centering, collimation, and image quality assessment.

RAYID aims to improve radiographic accuracy, reduce positioning errors, minimize unnecessary repeat examinations, and support consistent image quality while maintaining the radiographer's control over clinical decisions.

---

## 1. Project Overview

Digital radiography plays an essential role in modern medical imaging. However, positioning errors, incorrect exposure parameters, inadequate collimation, and image quality issues may result in repeated examinations and unnecessary radiation exposure.

RAYID addresses these challenges by providing intelligent assistance throughout the radiographic workflow.

The system is designed as an integrated assistant for existing Digital Radiography (DR) workstations rather than a replacement for conventional X-ray equipment.

---

## 2. Problem Statement

Radiographers must make several technical decisions during each examination, including:

- Selecting appropriate exposure parameters.
- Achieving accurate patient positioning.
- Identifying the correct anatomical centering point.
- Applying appropriate collimation boundaries.
- Evaluating the final radiographic image.

Errors in any of these steps may affect diagnostic image quality and lead to repeated exposures.

RAYID aims to provide structured assistance and real-time feedback to help reduce these errors.

---

## 3. Project Objectives

- Improve radiographic positioning accuracy.
- Support patient-specific exposure parameter selection.
- Assist with anatomical centering and collimation.
- Identify potential positioning and image quality errors.
- Provide immediate feedback and corrective recommendations.
- Reduce unnecessary repeat examinations.
- Promote consistency in digital radiography workflows.

---

## 4. Key Features

### 4.1 Exposure Parameter Optimization
- Provides examination-specific exposure recommendations.
- Considers available patient information and selected projections.
- Supports kVp, mA, mAs, exposure time, and AEC settings where applicable.
- Compares selected parameters with recommended values.
- Highlights potentially inappropriate settings.

### 4.2 Patient Positioning Assistance
- Provides examination-specific positioning guidance.
- Displays visual positioning references.
- Supports assessment of patient alignment and positioning.
- Identifies potential positioning errors.

### 4.3 Anatomical Centering
- Identifies recommended anatomical centering landmarks.
- Provides centering guidance for different examinations and projections.
- Supports manual centering adjustments.
- Highlights deviations from recommended centering positions.
- Includes an auto-centering assistance function.

### 4.4 Intelligent Collimation Guidance
- Provides examination-specific collimation recommendations.
- Supports manual adjustment of all four collimation boundaries.
- Identifies excessive or insufficient collimation.
- Highlights anatomy that may be excluded from the image.

### 4.5 Image Quality Assessment
- Evaluates radiographic image quality.
- Identifies potential errors such as:
- Anatomical cutoff.
- Incorrect centering.
- Rotation.
- Positioning errors.
- Inadequate anatomical coverage.
- Provides a quality score and assessment status.
- Displays recommendations for corrective action.

### 4.6 Real-Time Alerts
- Provides contextual warnings when incorrect settings or positioning are detected.
- Explains the identified issue.
- Suggests corrective actions.
- Allows the radiographer to review or override recommendations.

### 4.7 PACS Workflow Support
- Includes PACS workflow status indicators.
- Displays image transfer and storage status.
- Supports examination record association within the workflow.

---

## 5. System Workflow

RAYID supports the radiographic workflow through the following stages:

1. Patient Selection
Select the patient and review examination information.

2. Examination Selection
Select the required body part and radiographic projection.

3. Exposure Parameter Review
Review recommended exposure parameters and adjust settings when necessary.

4. Patient Positioning
Follow examination-specific positioning guidance.

5. Centering and Collimation
Review anatomical centering and collimation recommendations.

6. Positioning Validation
Review system feedback and correct any identified errors.

7. Image Acquisition
Proceed with the radiographic examination.

8. Image Quality Assessment
Review the acquired image, quality score, and identified findings.

9. Final Decision
Accept the image or consider corrective action when necessary.

---

## 6. Technology Stack

The project uses the following technologies:

- Frontend: React.js
- Build Tool: Vite
- Styling: Tailwind CSS
- Backend Services: Base44 Platform
- AI Integration: Base44 LLM Integration
- Version Control: Git and GitHub

The current version is a functional prototype developed using the Base44 platform.

---

## 7. Installation and Setup

To access the source code:

1. Clone the repository:

```bash
git clone <REPOSITORY_URL>
```

2. Navigate to the project directory:

```bash
cd RAYID
```

3. Install dependencies according to the project's package manager:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

*Note: These commands apply if the project uses a compatible Node.js setup. Refer to the project configuration files for the actual requirements.*

---

## 8. Project Structure

The repository may contain the following main components:

- `src/` – Application source code.
- `components/` – Reusable interface components.
- `assets/` – Images, icons, and visual resources.
- `public/` – Static assets.
- `README.md` – Project documentation.
- `package.json` – Project dependencies and scripts.

*The structure should be updated to match the actual repository.*

---

## 9. Clinical Scope and Limitations

RAYID is intended to assist radiographers and support the technical quality of digital radiography examinations.

It does not replace the radiographer's professional judgment or responsibility for clinical decisions.

The current development version is intended for demonstration and evaluation purposes. Recommendations and assessment results should not be considered clinically validated until they have undergone appropriate technical and clinical validation.

Actual integration with X-ray equipment, camera systems, AI inference services, and PACS infrastructure requires dedicated development and validation.

---

## 10. Future Development

Potential future development includes:

- Integration with existing DR acquisition workstations.
- Camera-based patient positioning analysis.
- Advanced AI-based image quality assessment.
- Automated anatomical landmark detection.
- DICOM and PACS integration.
- Expanded examination and projection coverage.
- Clinical testing and performance validation.

---

## 11. Contributors

Developed as a project focused on improving digital radiography workflows through intelligent software assistance.

---

## 12. Project Vision

**RAYID does not replace the existing X-ray system. It adds intelligence to it.**
