'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Entity {
  id: string;
  name: string;
  attributes: string[];
  relationships: string[];
  x: number;
  y: number;
}

export default function ERD() {
  const [entities, setEntities] = useState<Entity[]>([
    {
      id: '1',
      name: 'User',
      attributes: ['id', 'email', 'name', 'created_at'],
      relationships: ['has many Orders', 'has many Posts'],
      x: 100,
      y: 100
    },
    {
      id: '2',
      name: 'Order',
      attributes: ['id', 'user_id', 'total', 'status', 'created_at'],
      relationships: ['belongs to User', 'has many OrderItems'],
      x: 400,
      y: 100
    },
    {
      id: '3',
      name: 'Product',
      attributes: ['id', 'name', 'price', 'description', 'stock'],
      relationships: ['has many OrderItems'],
      x: 100,
      y: 300
    },
    {
      id: '4',
      name: 'OrderItem',
      attributes: ['id', 'order_id', 'product_id', 'quantity', 'price'],
      relationships: ['belongs to Order', 'belongs to Product'],
      x: 400,
      y: 300
    }
  ]);

  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entity Relationship Diagram</h1>
          <p className="text-gray-600">Visualize your database schema and relationships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Import Schema
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Add Entity
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ERD Canvas */}
        <div className="lg:col-span-3">
          <Card className="h-96">
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
              <CardDescription>Drag entities to position them</CardDescription>
            </CardHeader>
            <CardContent className="relative h-80 overflow-auto">
              <svg width="100%" height="100%" className="absolute inset-0">
                {/* Draw relationships */}
                {entities.map((entity) => {
                  const relatedEntities = entities.filter(e => 
                    e.relationships.some(rel => rel.includes(entity.name))
                  );
                  return relatedEntities.map((related) => (
                    <line
                      key={`${entity.id}-${related.id}`}
                      x1={entity.x + 100}
                      y1={entity.y + 50}
                      x2={related.x + 100}
                      y2={related.y + 50}
                      stroke="#e5e7eb"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  ));
                })}
                
                {/* Draw entities */}
                {entities.map((entity) => (
                  <g key={entity.id}>
                    <rect
                      x={entity.x}
                      y={entity.y}
                      width="200"
                      height="100"
                      fill={selectedEntity === entity.id ? "#dbeafe" : "#f9fafb"}
                      stroke={selectedEntity === entity.id ? "#3b82f6" : "#d1d5db"}
                      strokeWidth="2"
                      rx="8"
                      className="cursor-pointer"
                      onClick={() => setSelectedEntity(entity.id)}
                    />
                    <text
                      x={entity.x + 10}
                      y={entity.y + 25}
                      className="font-semibold text-gray-900"
                    >
                      {entity.name}
                    </text>
                    {entity.attributes.map((attr, index) => (
                      <text
                        key={attr}
                        x={entity.x + 15}
                        y={entity.y + 45 + (index * 15)}
                        className="text-sm text-gray-600"
                      >
                        {attr}
                      </text>
                    ))}
                  </g>
                ))}
                
                {/* Arrow marker definition */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#9ca3af"
                    />
                  </marker>
                </defs>
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Entity Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Entity Details</CardTitle>
              <CardDescription>
                {selectedEntity ? 'Selected entity' : 'Select an entity to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEntity ? (
                <div className="space-y-4">
                  {(() => {
                    const entity = entities.find(e => e.id === selectedEntity);
                    if (!entity) return null;
                    
                    return (
                      <>
                        <div>
                          <h4 className="font-semibold text-gray-900">{entity.name}</h4>
                          <p className="text-sm text-gray-600">Entity</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Attributes</h5>
                          <ul className="space-y-1">
                            {entity.attributes.map((attr) => (
                              <li key={attr} className="text-sm text-gray-600">
                                • {attr}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Relationships</h5>
                          <ul className="space-y-1">
                            {entity.relationships.map((rel) => (
                              <li key={rel} className="text-sm text-gray-600">
                                • {rel}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Delete
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Click on an entity in the diagram to view its details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
