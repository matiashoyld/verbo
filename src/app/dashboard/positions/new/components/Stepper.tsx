import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { steps } from "./data";

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
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
