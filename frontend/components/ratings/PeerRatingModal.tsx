"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Award, Users, AlertCircle } from "lucide-react";
import { peerRatingService, EligiblePeer } from "@/services/peerRatingService";

interface PeerRatingModalProps {
  roomId: string;
  roomTitle?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRatingsSubmitted?: () => void;
  triggerButtonText?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Needs improvement",
  2: "Slightly helpful",
  3: "Helpful & cooperative",
  4: "Very helpful & proactive",
  5: "Extremely helpful & outstanding!",
};

export default function PeerRatingModal({
  roomId,
  roomTitle = "Study Session",
  isOpen,
  onOpenChange,
  onRatingsSubmitted,
  triggerButtonText = "Rate Study Session Peers",
}: PeerRatingModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [peers, setPeers] = useState<EligiblePeer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeerId, setSelectedPeerId] = useState<string>("");
  const [ratingsState, setRatingsState] = useState<Record<string, { rating: number; feedback: string }>>({});
  const [hoveredStar, setHoveredStar] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadEligiblePeers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await peerRatingService.getEligiblePeers(roomId);
      setPeers(data);

      // Prepopulate ratingsState with existing ratings if available
      const initial: Record<string, { rating: number; feedback: string }> = {};
      data.forEach((p) => {
        initial[p.user_id] = {
          rating: p.current_rating || 5,
          feedback: p.current_feedback || "",
        };
      });
      setRatingsState(initial);

      if (data.length > 0 && !selectedPeerId) {
        setSelectedPeerId(data[0].user_id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load study session peers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadEligiblePeers();
      setSuccessMessage(null);
    }
  }, [open, roomId]);

  const handleRatingChange = (peerId: string, rating: number) => {
    setRatingsState((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        rating,
      },
    }));
  };

  const handleFeedbackChange = (peerId: string, feedback: string) => {
    setRatingsState((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        feedback,
      },
    }));
  };

  const handleSubmitSingle = async (peerId: string) => {
    const peerData = ratingsState[peerId];
    if (!peerData || !peerData.rating) {
      setErrorMessage("Please select a rating score between 1 and 5 stars.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await peerRatingService.submitRating({
        room_id: roomId,
        ratee_id: peerId,
        rating: peerData.rating,
        feedback: peerData.feedback,
      });

      setSuccessMessage(`Helpfulness rating submitted for ${peers.find((p) => p.user_id === peerId)?.username || "peer"}!`);
      await loadEligiblePeers();
      onRatingsSubmitted?.();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAll = async () => {
    if (peers.length === 0) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        room_id: roomId,
        ratings: peers.map((p) => ({
          ratee_id: p.user_id,
          rating: ratingsState[p.user_id]?.rating || 5,
          feedback: ratingsState[p.user_id]?.feedback || "",
        })),
      };

      await peerRatingService.submitBatchRatings(payload);
      setSuccessMessage("All peer helpfulness ratings submitted successfully!");
      await loadEligiblePeers();
      onRatingsSubmitted?.();
      setTimeout(() => {
        setOpen(false);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit batch ratings.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-2">
          <Star className="w-4 h-4 fill-white" />
          {triggerButtonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                FR13: Rate Peer Helpfulness
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Session: <span className="font-semibold text-slate-700">{roomTitle}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Finding study session participants...
          </div>
        ) : peers.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No other participants found in this session to rate.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Peer Selection Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-100">
              {peers.map((p) => (
                <button
                  key={p.user_id}
                  onClick={() => setSelectedPeerId(p.user_id)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedPeerId === p.user_id
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {p.username}
                  {p.has_rated && (
                    <CheckCircle className={`w-3.5 h-3.5 ${selectedPeerId === p.user_id ? "text-white" : "text-green-600"}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Selected Peer Rating Form */}
            {selectedPeerId && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {peers.find((p) => p.user_id === selectedPeerId)?.username}
                    </h4>
                    <p className="text-xs text-slate-500">How helpful was this member in the session?</p>
                  </div>
                  {peers.find((p) => p.user_id === selectedPeerId)?.has_rated && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-[11px]">
                      Already Rated
                    </Badge>
                  )}
                </div>

                {/* 5-Star Interactive Rating */}
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const currentScore = ratingsState[selectedPeerId]?.rating || 0;
                      const activeStar = hoveredStar[selectedPeerId] || currentScore;
                      const isFilled = star <= activeStar;

                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() =>
                            setHoveredStar((prev) => ({ ...prev, [selectedPeerId]: star }))
                          }
                          onMouseLeave={() =>
                            setHoveredStar((prev) => ({ ...prev, [selectedPeerId]: 0 }))
                          }
                          onClick={() => handleRatingChange(selectedPeerId, star)}
                          className="p-1 hover:scale-110 transition transform focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition ${
                              isFilled ? "fill-amber-400 text-amber-400" : "text-slate-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="text-xs font-semibold text-amber-700 ml-2">
                      {RATING_LABELS[hoveredStar[selectedPeerId] || ratingsState[selectedPeerId]?.rating || 5]}
                    </span>
                  </div>
                </div>

                {/* Qualitative Feedback Textarea */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Helpfulness Comments & Feedback (Optional)
                  </label>
                  <Textarea
                    rows={2}
                    value={ratingsState[selectedPeerId]?.feedback || ""}
                    onChange={(e) => handleFeedbackChange(selectedPeerId, e.target.value)}
                    placeholder="e.g., Explaining difficult concepts clearly, sharing useful notes, active participation..."
                    className="text-xs bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitSingle(selectedPeerId)}
                    disabled={submitting}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    {submitting ? "Saving..." : "Save Rating for this Peer"}
                  </Button>
                </div>
              </div>
            )}

            {/* Batch Submission Footer */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                {peers.filter((p) => p.has_rated).length} of {peers.length} peers rated
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitAll}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  {submitting ? "Submitting..." : "Submit All Session Ratings"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
