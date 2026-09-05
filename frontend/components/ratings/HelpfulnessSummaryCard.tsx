"use client";

import { useEffect, useState } from "react";
import { peerRatingService, RatingSummary } from "@/services/peerRatingService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award, MessageSquareQuote, ThumbsUp } from "lucide-react";

interface HelpfulnessSummaryCardProps {
  userId: string;
  userName?: string;
  refreshTrigger?: number;
}

export default function HelpfulnessSummaryCard({
  userId,
  userName = "Member",
  refreshTrigger = 0,
}: HelpfulnessSummaryCardProps) {
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    peerRatingService
      .getUserSummary(userId)
      .then((data) => {
        if (isMounted) {
          setSummary(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Could not load rating summary");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, refreshTrigger]);

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center text-sm text-slate-400">
          Loading peer helpfulness profile...
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center text-sm text-red-500">
          {error || "Unable to display peer helpfulness summary"}
        </CardContent>
      </Card>
    );
  }

  const { average_rating, total_ratings, rating_distribution, recent_feedback } = summary;

  return (
    <Card className="shadow-sm border-slate-200 bg-white">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Peer Helpfulness Reputation
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Post-session peer feedback for <span className="font-semibold text-slate-700">{userName}</span>
          </p>
        </div>
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium">
          FR13 Verified
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Main rating score banner */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="text-center sm:border-r sm:border-slate-200 sm:pr-6 min-w-[120px]">
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {total_ratings > 0 ? average_rating.toFixed(1) : "—"}
            </div>
            <div className="flex justify-center items-center gap-1 mt-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(average_rating) && total_ratings > 0
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {total_ratings} {total_ratings === 1 ? "rating" : "ratings"}
            </p>
          </div>

          {/* Star distribution bars */}
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = rating_distribution[stars] || 0;
              const percent = total_ratings > 0 ? Math.round((count / total_ratings) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-10 text-slate-600 font-medium flex items-center gap-0.5">
                    {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-500 text-[11px]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent peer feedback quotes */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-blue-600" />
            Recent Peer Remarks
          </h4>
          {recent_feedback.length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
              No written comments left yet. Participants can leave constructive feedback when rating.
            </p>
          ) : (
            <div className="space-y-2">
              {recent_feedback.slice(0, 3).map((comment, idx) => (
                <div
                  key={idx}
                  className="text-xs text-slate-700 bg-blue-50/60 border border-blue-100 p-2.5 rounded-lg flex items-start gap-2"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="italic">"{comment}"</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
