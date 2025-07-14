export const surprisePrompts = [
  "AI-powered fitness for busy professionals",
  "Sustainable packaging for e-commerce",
  "Mental health support for remote workers", 
  "Food waste reduction in restaurants",
  "Elderly care technology solutions",
  "Carbon footprint tracking for individuals",
  "Micro-learning for skill development",
  "Smart home energy optimization",
  "Local community marketplace",
  "Digital detox and mindfulness tools",
  "Voice-controlled accessibility tools",
  "Blockchain-based supply chain tracking",
  "AR/VR for remote team collaboration",
  "IoT sensors for urban agriculture",
  "Personalized nutrition using AI",
  "Quantum computing for drug discovery",
  "Renewable energy storage solutions",
  "Autonomous drone delivery networks",
  "Virtual reality therapy platforms",
  "Decentralized social media platforms"
];

export function getRandomPrompt(): string {
  return surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
}
