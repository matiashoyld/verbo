import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface Competency {
  id: string;
  name: string;
  skillName: string;
  level: number;
}

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
    topCompetencies: Competency[];
  };
  index: number;
}

const SkillLevel: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={cn(
            "mx-0.5 h-1.5 w-1.5 rounded-full",
            dot <= level ? "bg-verbo-purple" : "bg-gray-200",
          )}
        />
      ))}
    </div>
  );
};

export function CandidateCard({ candidate, index = 0 }: CandidateCardProps) {
  // Generate avatar fallback from name or email
  const generateFallback = () => {
    if (candidate.name) {
      return candidate.name.charAt(0).toUpperCase();
    }
    return candidate.email.charAt(0).toUpperCase();
  };

  // Extract email domain as location (simplified approach)
  const getLocation = () => {
    const emailParts = candidate.email.split("@");
    if (emailParts.length > 1 && emailParts[1]) {
      const domainParts = emailParts[1].split(".");
      if (domainParts.length > 0 && domainParts[0]) {
        return domainParts[0];
      }
    }
    return "Unknown";
  };

  // Calculate animation delay
  const animationDelay = typeof index === "number" ? `${index * 50}ms` : "0ms";

  return (
    <Card
      className="animate-fade-in overflow-hidden transition-all hover:shadow-md"
      style={{
        animationDelay,
        animationFillMode: "both",
      }}
    >
      <CardHeader className="pb-0">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage
                src={candidate.imageUrl || undefined}
                alt={candidate.name || candidate.email}
              />
              <AvatarFallback className="bg-verbo-purple/10 text-verbo-purple">
                {generateFallback()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400"></span>
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="truncate text-lg font-semibold text-verbo-dark">
              {candidate.name || "No Name"}
            </h3>
            <p className="mb-3 truncate text-sm text-muted-foreground">
              {candidate.email}
            </p>

            <div className="space-y-2">
              {candidate.topCompetencies.map((competency) => (
                <div
                  key={competency.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-foreground/70">
                    {competency.name}
                  </span>
                  <SkillLevel level={competency.level} />
                </div>
              ))}

              {candidate.topCompetencies.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No assessment data yet
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-4 border-t border-border/30 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{getLocation()}</span>
          <button className="rounded-full bg-verbo-purple/10 px-3 py-1 text-xs font-medium text-verbo-purple transition-colors hover:bg-verbo-purple/20">
            View Profile
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
