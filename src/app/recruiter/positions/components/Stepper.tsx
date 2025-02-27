import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  // Steps for the multi-step form defined within the component
  const steps = [
    {
      title: "Job Description",
      description: "Enter or upload the job description",
    },
    { title: "Skills", description: "Review and edit required skills" },
    {
      title: "Assessment",
      description: "Review and customize the technical case",
    },
  ];

  return (
    <div className="mb-8">
      <Breadcrumb>
        <BreadcrumbList>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  className={
                    currentStep === i + 1
                      ? "font-medium text-foreground"
                      : currentStep > i + 1
                        ? "text-muted-foreground"
                        : "pointer-events-none text-muted-foreground/50"
                  }
                >
                  {s.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {i < steps.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
