# EduSign - Sign Language Learning Platform

EduSign is a comprehensive, interactive web application designed to bridge the communication gap between hearing and deaf communities. It empowers users to learn sign language through intuitive lessons, real-time AI feedback, and interactive practice experiences.

![EduSign Banner](https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=2070)

## 🚀 Features

- **Video Dictionary**: A curated collection of common sign language gestures with high-quality video demonstrations.
- **AI-Powered Practice**: Real-time hand landmark detection and gesture recognition using Google's MediaPipe, providing instant feedback on your signs.
- **Interactive Quizzes**: Test your knowledge with dynamically generated quizzes that use separate, text-free videos and 3D avatar assets.
- **Dynamic Progress Tracking**: Earn XP, level up, and maintain streaks as you learn. Your progress is persisted across sessions.
- **Offline Support (PWA)**: Install EduSign on your device and use it anywhere, even without an internet connection.
- **Custom Aesthetic**: A beautiful, warm dark theme designed for focus and readability.
- **Complete Auth Flow**: Secure login and signup pages to personalize your learning journey.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS with custom variables and glassmorphism
- **AI/ML**: MediaPipe Tasks Vision (Hand Landmarker)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Persistence**: LocalStorage (Redux/Context API patterns)
- **Offline**: Vite PWA Plugin (Service Workers)

## 📦 Installation

To get EduSign running locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shrishti0802/EduSign.git
   cd EduSign
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📱 Progressive Web App (PWA)

EduSign is optimized as a PWA. To install it:
1. Open the app in a supported browser (Chrome, Safari, Edge).
2. Click the "Add to Home Screen" or "Install" prompt in the address bar or share menu.
3. The app will now work offline, including the AI Practice feature (after initial model caching).

## 🌐 Deployment

EduSign is deployment-ready and can be hosted on platforms like Vercel, Netlify, or GitHub Pages.

### Deploying to Vercel
1. Connect your GitHub account to Vercel.
2. Select the `EduSign` repository.
3. Click "Deploy".

## 🤝 Contributing

Contributions are welcome! If you'd like to improve EduSign, feel free to fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
