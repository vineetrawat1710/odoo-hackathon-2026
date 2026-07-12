import React from 'react';
import { Wrench } from 'lucide-react';
import { Card, CardContent } from '../components/card/card';

export const Maintenance: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-amber-50 p-4 rounded-full mb-4">
            <Wrench className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Maintenance Module</h2>
          <p className="text-slate-500 max-w-md">
            The maintenance module is currently being integrated with the new backend API. Please check back later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
