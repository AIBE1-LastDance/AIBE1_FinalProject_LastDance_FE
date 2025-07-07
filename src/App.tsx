import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { VERSION, BUILD_TIME } from "./version";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import LoginPage from "./components/auth/LoginPage";
import OAuthCallback from "./components/auth/OAuthCallback";
import HomePage from "./components/home/HomePage";
import DashboardPage from "./components/dashboard/DashboardPage";
import CalendarPage from "./components/calendar/CalendarPage";
import TasksPage from "./components/tasks/TasksPage";
import ExpensesPage from "./components/expenses/ExpensesPage";
import GamesPage from "./components/games/GamesPage";
import RoulettePage from "./components/games/RoulettePage";
import LadderGamePage from "./components/games/LadderGamePage";
import YahtzeeGame from "./components/games/YahtzeeGame";
import AIAssistantPage from "./components/ai/AIAssistantPage";
import CommunityPage from "./components/community/CommunityPage";
import PostDetailPage from "./components/community/PostDetailPage";
import SettingsPage from "./components/settings/SettingsPage";
import { useAuth } from "./hooks/useAuth";
import { useEffect, useState } from "react";
import AdminRouter from "./components/admin/AdminRouter";
// SSE 관리를 위해 추가
import { useNotifications } from "./hooks/useNotifications";
import { useAppStore } from "./store/appStore.ts";
import YouthPolicyList from "./components/youthpolicy/YouthPolicyList";
import YouthPolicyDetailPage from "./components/youthpolicy/YouthPolicyDetailPage";

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { getCurrentUser } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const setMode = useAppStore((state) => state.setMode);

  // 🔥 앱 최상위에서 SSE 연결 관리 (한 번만 실행)
  useNotifications();

  console.log("App component rendered, isAuthenticated:", isAuthenticated);

  // 관리자 권한 확인
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    // 이미 초기화되었거나 실행 중이면 스킵
    if (isInitialized) {
      return;
    }

    // 앱 시작시 쿠키 확인해서 사용자 정보 가져오기
    const initAuth = async () => {
      try {
        console.log("인증 상태 초기화 중...");
        const user = await getCurrentUser();

        if (user) {
          const savedData = localStorage.getItem(`userMode_${user.id}`);
          if (savedData) {
            try {
              const data = JSON.parse(savedData);
              const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30일

              if (Date.now() - data.timestamp < thirtyDays) {
                // 만료되지 않은 경우
                useAppStore
                  .getState()
                  .setMode(data.mode as "personal" | "group");
                if (data.mode === "group") {
                  await useAppStore.getState().loadMyGroups();
                }
              } else {
                localStorage.removeItem(`userMode_${user.id}`);
              }
            } catch (error) {
              console.error("저장된 데이터 파싱 오류, 삭제합니다: ", error);
              localStorage.removeItem(`userMode_${user.id}`);
            }
          }
        }

        if (!user) {
          // 유저 정보가 없으면 로컬 스토리지 정리
          console.log("유효한 사용자 정보가 없습니다. 로컬 스토리지 정리");
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("app-storage-v4");
        }
      } catch (error) {
        // 쿠키 없음 또는 오류 발생
        console.error("인증 초기화 실패:", error);
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("app-storage-v4");
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [isInitialized]);

  // 초기화 완료되기 전에는 로딩 표시
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      {/* Version indicator for debugging */}
      <div
        style={{
          position: "fixed",
          bottom: "5px",
          right: "5px",
          fontSize: "10px",
          color: "rgba(0,0,0,0.3)",
          zIndex: 9999,
          padding: "2px 5px",
          backgroundColor: "rgba(255,255,255,0.7)",
          borderRadius: "3px",
        }}
      >
        v{VERSION} ({BUILD_TIME.substring(0, 16).replace("T", " ")})
      </div>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <HomePage />
            )
          }
        />
        <Route path="/oauth2/authorization/*" element={<OAuthCallback />} />
        <Route path="/login/oauth2/code/*" element={<OAuthCallback />} />
        <Route path="/oauth2/code/*" element={<OAuthCallback />} />
        <Route path="/auth/callback/*" element={<OAuthCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <CalendarPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <TasksPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Layout>
                <ExpensesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <Layout>
                <GamesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/roulette"
          element={
            <ProtectedRoute>
              <Layout>
                <RoulettePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/ladder"
          element={
            <ProtectedRoute>
              <Layout>
                <LadderGamePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/yahtzee"
          element={
            <ProtectedRoute>
              <Layout>
                <YahtzeeGame />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <Layout>
                <AIAssistantPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Layout>
                <CommunityPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/:postId"
          element={
            <ProtectedRoute>
              <Layout>
                <PostDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* ⭐ 청년 정책 페이지 라우트 추가 */}
        <Route
          path="/youth-policy"
          element={
            <ProtectedRoute>
              <Layout>
                <YouthPolicyList /> {/* YouthPolicyList 컴포넌트 렌더링 */}
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Admin Routes - 관리자만 접근 가능 */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminRouter />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
