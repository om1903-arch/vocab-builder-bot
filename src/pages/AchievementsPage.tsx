import Layout from '@/components/Layout';
import Achievements from '@/components/Achievements';

const AchievementsPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">الإنجازات 🏆</h1>
        <p className="text-muted-foreground">أكمل المهام واحصل على شارات التميز</p>
        <Achievements />
      </div>
    </Layout>
  );
};

export default AchievementsPage;
