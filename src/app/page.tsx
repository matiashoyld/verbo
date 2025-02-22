import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              AI-Powered Skill Assessment
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Transform your hiring process with automated, AI-driven skill
              assessments. Get deeper insights into candidate capabilities while
              saving time and resources.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button size="lg" className="text-base">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Powerful Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to assess candidates
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A comprehensive platform designed to streamline your recruitment
            process with AI-powered assessments and real-time analytics.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
            <FeatureCard
              title="AI-Driven Evaluation"
              description="Leverage advanced AI to assess technical and soft skills through interactive challenges."
            />
            <FeatureCard
              title="Automated Feedback"
              description="Provide instant, detailed feedback to candidates while generating comprehensive reports for recruiters."
            />
            <FeatureCard
              title="Screen & Audio Recording"
              description="Capture candidate interactions and responses for thorough assessment and review."
            />
            <FeatureCard
              title="Skill-Based Challenges"
              description="Create custom challenges targeting specific skills and competencies."
            />
            <FeatureCard
              title="Real-time Analytics"
              description="Track candidate performance and gather insights with detailed analytics."
            />
            <FeatureCard
              title="Time Efficiency"
              description="Reduce manual evaluation time while maintaining assessment quality."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
