import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {useAuthStore} from './store/authStore';
import {VERSION, BUILD_TIME} from './version';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import LoginPage from './components/auth/LoginPage';
import HomePage from './components/home/HomePage';
import DashboardPage from './components/dashboard/DashboardPage';
import CalendarPage from './components/calendar/CalendarPage';
import TasksPage from './components/tasks/TasksPage';
import ExpensesPage from './components/expenses/ExpensesPage';
import GamesPage from './components/games/GamesPage';
import RoulettePage from './components/games/RoulettePage';
import LadderGamePage from './components/games/LadderGamePage';
import YahtzeeGame from './components/games/YahtzeeGame';
import AIAssistantPage from './components/ai/AIAssistantPage';
import CommunityPage from './components/community/CommunityPage';
import PostDetailPage from './components/community/PostDetailPage';
import SettingsPage from './components/settings/SettingsPage';

function App() {
    const {isAuthenticated} = useAuthStore();

    console.log('App component rendered, isAuthenticated:', isAuthenticated);

    return (
        <Router>
            <ScrollToTop/>
            {/* Version indicator for debugging */}
            <div style={{
                position: 'fixed',
                bottom: '5px',
                right: '5px',
                fontSize: '10px',
                color: 'rgba(0,0,0,0.3)',
                zIndex: 9999,
                padding: '2px 5px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderRadius: '3px'
            }}>
                v{VERSION} ({BUILD_TIME.substring(0, 16).replace('T', ' ')})
            </div>
            <Routes>
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace/> : <LoginPage/>}
                />
                <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace/> : <HomePage/>}
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <DashboardPage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/calendar"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <CalendarPage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <TasksPage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/expenses"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ExpensesPage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/games"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <GamesPage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/games/roulette"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <RoulettePage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/games/ladder"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <LadderGamePage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/games/yatzy"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <YahtzeeGame/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ai-assistant"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AIAssistantPage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/community"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <CommunityPage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/community/:postId"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <PostDetailPage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <SettingsPage/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
