import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import ApiDocumentation from '@/pages/ApiDocumentation';
import DatasetDescription from '@/pages/DatasetDescription';
import ModelDescription from '@/pages/ModelDescription';
import ModelPrediction from '@/pages/ModelPrediction';
import ResearchDescription from '@/pages/ResearchDescription';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ResearchDescription />} />
        <Route path="model" element={<ModelDescription />} />
        <Route path="dataset" element={<DatasetDescription />} />
        <Route path="model-prediction" element={<ModelPrediction />} />
        {/* <Route path="api" element={<ApiDocumentation />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
