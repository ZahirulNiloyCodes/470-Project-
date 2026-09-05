import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  Sparkles,
  Award,
  Presentation,
  MessageSquare,
  HelpCircle,
  Monitor,
  Search,
  CheckSquare,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              E
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">EduStream</span>
              <span className="text-xs text-blue-400 block -mt-1 font-mono">Unified Platform</span>
            </div>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Link href="/demo">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                All Features Hub
              </Button>
            </Link>
            <Link href="/rooms/room-1">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                Live Room
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                Dashboard
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Register
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            Complete 3-Member Teammate Suite Merged & Operational
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            The Complete Collaborative <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Virtual Study Room Platform
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            All features from Member 1, Member 2, and Member 3 are merged into one unified application: real-time whiteboards, group chat, synchronized Pomodoro, AI flashcards, peer ratings, Kanban boards, resource hubs, and session logging.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <Link href="/rooms/room-1">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/20 flex items-center gap-2">
                Launch Live Study Room (room-1)
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-100 font-semibold px-6">
                Open All-Features Demo Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Member Workspaces Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full flex-1 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Teammate Feature Distribution</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Click any feature or room link below to test the components directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MEMBER 1 CARD */}
          <Card className="bg-slate-900/70 border-slate-800 text-slate-100 hover:border-blue-500/50 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono text-xs">
                  Member 1
                </Badge>
                <span className="text-xs text-slate-500">4 Features</span>
              </div>
              <CardTitle className="text-xl font-bold text-white">Study Rooms & Ratings</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR1: Study Rooms:</strong>
                    <span className="text-slate-400 block text-xs">Create, browse, and join collaborative study spaces.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR5: Shared Pomodoro:</strong>
                    <span className="text-slate-400 block text-xs">Synchronized focus/break timer with host controls.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR9: AI Flashcard Generator:</strong>
                    <span className="text-slate-400 block text-xs">Instant Q&A cards from lecture notes via OpenAI.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR13: Peer Rating System:</strong>
                    <span className="text-slate-400 block text-xs">Post-session helpfulness evaluation & score cards.</span>
                  </div>
                </li>
              </ul>

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <Link href="/demo" className="w-full">
                  <Button variant="secondary" size="sm" className="w-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400">
                    Test Member 1 Features &rarr;
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* MEMBER 2 CARD */}
          <Card className="bg-slate-900/70 border-slate-800 text-slate-100 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <Badge className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-mono text-xs">
                  Member 2
                </Badge>
                <span className="text-xs text-slate-500">5 Features</span>
              </div>
              <CardTitle className="text-xl font-bold text-white">Live Collaboration & Auth</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Presentation className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR2: Whiteboard Canvas:</strong>
                    <span className="text-slate-400 block text-xs">Multi-user real-time drawing & collaborative canvas.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR6: Live Group Chat:</strong>
                    <span className="text-slate-400 block text-xs">WebSocket room chat with user badges and timestamps.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR10: Anonymous Q&A:</strong>
                    <span className="text-slate-400 block text-xs">Post questions anonymously, upvote, and resolve.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Monitor className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR14: Screen Sharing:</strong>
                    <span className="text-slate-400 block text-xs">Stream screen/window directly to room participants.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Auth & Dashboard:</strong>
                    <span className="text-slate-400 block text-xs">JWT authentication, bcrypt security, profile dashboard.</span>
                  </div>
                </li>
              </ul>

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <Link href="/rooms/room-1" className="w-full">
                  <Button variant="secondary" size="sm" className="w-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-400">
                    Open Live Room & Collaboration &rarr;
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* MEMBER 3 CARD */}
          <Card className="bg-slate-900/70 border-slate-800 text-slate-100 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs">
                  Member 3
                </Badge>
                <span className="text-xs text-slate-500">4 Features</span>
              </div>
              <CardTitle className="text-xl font-bold text-white">Search, Tasks & Logs</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Search className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR3: Global Room Search:</strong>
                    <span className="text-slate-400 block text-xs">Instant query search and topic tag filtering.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR7: Kanban Task Board:</strong>
                    <span className="text-slate-400 block text-xs">To-Do, In Progress, Done drag & drop status flow.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR11: Resource Hub:</strong>
                    <span className="text-slate-400 block text-xs">Upload links, slides, and study PDFs per room.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">FR15: Session Logger:</strong>
                    <span className="text-slate-400 block text-xs">Record study time duration and view session history.</span>
                  </div>
                </li>
              </ul>

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <Link href="/demo" className="w-full">
                  <Button variant="secondary" size="sm" className="w-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400">
                    Test Member 3 Components &rarr;
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complete Feature Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Full Feature Navigation Matrix (FR1 – FR15)</h3>
              <p className="text-xs text-slate-400">Direct links to access every single component across the project.</p>
            </div>
            <Link href="/rooms/room-1">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">
                Enter Unified Room (room-1)
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <Link href="/demo" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR1:</strong> Study Rooms</span>
              <span className="text-blue-400 group-hover:underline">/demo &rarr;</span>
            </Link>
            <Link href="/rooms/room-1" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR2:</strong> Collaborative Canvas</span>
              <span className="text-blue-400 group-hover:underline">/rooms/room-1 &rarr;</span>
            </Link>
            <Link href="/demo" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR3:</strong> Global Room Search</span>
              <span className="text-blue-400 group-hover:underline">/demo &rarr;</span>
            </Link>
            <Link href="/demo" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR5:</strong> Synchronized Pomodoro</span>
              <span className="text-blue-400 group-hover:underline">/demo &rarr;</span>
            </Link>
            <Link href="/rooms/room-1" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR6:</strong> Real-time Group Chat</span>
              <span className="text-blue-400 group-hover:underline">/rooms/room-1 &rarr;</span>
            </Link>
            <Link href="/rooms/room-1" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR7:</strong> Kanban Task Board</span>
              <span className="text-blue-400 group-hover:underline">/rooms/room-1 &rarr;</span>
            </Link>
            <Link href="/demo" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR9:</strong> AI Flashcard Generator</span>
              <span className="text-blue-400 group-hover:underline">/demo &rarr;</span>
            </Link>
            <Link href="/rooms/room-1" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR10:</strong> Anonymous Q&A</span>
              <span className="text-blue-400 group-hover:underline">/rooms/room-1 &rarr;</span>
            </Link>
            <Link href="/rooms/room-1" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR11:</strong> Room Resource Hub</span>
              <span className="text-blue-400 group-hover:underline">/rooms/room-1 &rarr;</span>
            </Link>
            <Link href="/demo" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR13:</strong> Peer Rating System</span>
              <span className="text-blue-400 group-hover:underline">/demo &rarr;</span>
            </Link>
            <Link href="/rooms/room-1" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR14:</strong> Screen Sharing</span>
              <span className="text-blue-400 group-hover:underline">/rooms/room-1 &rarr;</span>
            </Link>
            <Link href="/demo" className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex justify-between items-center group">
              <span><strong>FR15:</strong> Study Session Logger</span>
              <span className="text-blue-400 group-hover:underline">/demo &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        EduStream Virtual Study Room Platform &copy; 2026. Merged workspace uniting Member 1, Member 2, and Member 3.
      </footer>
    </div>
  );
}

