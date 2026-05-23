/**
 * BharatExams AI - Real-time Status and Proximity Countdown Engine
 */

export interface StatusEngineResult {
  label: string;
  daysRemaining: number;
  badgeType: "green" | "red" | "gray" | "blue" | "purple";
  description: string;
  actionText: string;
}

export function getExamStatus(
  lastDateStr?: string,
  examDateStr?: string,
  admitCardStatus?: string,
  resultStatus?: string
): StatusEngineResult {
  const now = new Date();
  
  // 1. Check for Result declaration
  if (resultStatus && (resultStatus.toLowerCase().includes("declared") || resultStatus.toLowerCase().includes("published") || resultStatus.toLowerCase().includes("out"))) {
    return {
      label: "Result Declared",
      daysRemaining: 0,
      badgeType: "purple",
      description: "Result published officially! Check your scorecard now.",
      actionText: "Check Results"
    };
  }

  // 2. Check for Admit Card availability
  if (admitCardStatus && (admitCardStatus.toLowerCase().includes("available") || admitCardStatus.toLowerCase().includes("released") || admitCardStatus.toLowerCase().includes("out"))) {
    return {
      label: "Admit Card Available",
      daysRemaining: 0,
      badgeType: "purple",
      description: "Admit card is released. Download immediately.",
      actionText: "Download Admit Card"
    };
  }

  // 3. Fallback to Countdown if lastDate string exists
  if (!lastDateStr) {
    return {
      label: "Active Tracking",
      daysRemaining: 30,
      badgeType: "green",
      description: "Releasing registrations shortly.",
      actionText: "Prepare Now"
    };
  }

  const lastDate = new Date(lastDateStr);
  const timeDiff = lastDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return {
      label: "Application Closed",
      daysRemaining: 0,
      badgeType: "gray",
      description: "Registrations are closed for this cycle.",
      actionText: "Syllabus & Details"
    };
  }

  if (daysDiff === 0) {
    return {
      label: "Last Date Today",
      daysRemaining: 0,
      badgeType: "red",
      description: "URGENT: Portal closing midnight! Apply immediately.",
      actionText: "Apply Now"
    };
  }

  if (daysDiff === 1) {
    return {
      label: "Last Date Tomorrow",
      daysRemaining: 1,
      badgeType: "red",
      description: "Closes in 1 day. Do not wait for server load issues.",
      actionText: "Apply Now"
    };
  }

  if (daysDiff <= 5) {
    return {
      label: `${daysDiff} Days Left`,
      daysRemaining: daysDiff,
      badgeType: "red",
      description: "Alert: Last date is near! Complete your fees.",
      actionText: "Apply Now"
    };
  }

  // Upcoming / Not started yet or active with healthy duration
  let examDaysRemaining = -1;
  if (examDateStr) {
    const examDate = new Date(examDateStr);
    const examDiff = examDate.getTime() - now.getTime();
    examDaysRemaining = Math.ceil(examDiff / (1000 * 60 * 60 * 24));
  }

  if (examDaysRemaining > 0 && examDaysRemaining <= 10) {
    return {
      label: `Exam in ${examDaysRemaining} Days`,
      daysRemaining: examDaysRemaining,
      badgeType: "blue",
      description: `Target revision. Mock drills active. Just ${examDaysRemaining} days remaining!`,
      actionText: "Take Practice Mock"
    };
  }

  return {
    label: "Apply Now",
    daysRemaining: daysDiff,
    badgeType: "green",
    description: `Form started. ${daysDiff} days remaining to apply.`,
    actionText: "Apply Online"
  };
}
