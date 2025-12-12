import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";

export function ResourcesModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Mental Health Resources</DialogTitle>
          <DialogDescription>
            Reaching out is a sign of strength. Here are some resources that can help.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-2">
            <h3 className="font-semibold text-gray-800">KIRAN Mental Health Helpline (India)</h3>
            <p className="text-sm text-gray-600">A 24/7 national helpline for mental health support.</p>
            <a href="tel:1800-599-0019">
              <Button className="w-full bg-violet-600 hover:bg-violet-700">Call 1800-599-0019</Button>
            </a>
          </div>
          <div className="flex flex-col space-y-2">
            <h3 className="font-semibold text-gray-800">AASRA</h3>
            <p className="text-sm text-gray-600">Provides confidential support for individuals in emotional distress.</p>
            <a href="http://www.aasra.info/helpline.html" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">Visit Website</Button>
            </a>
          </div>
          <div className="flex flex-col space-y-2">
            <h3 className="font-semibold text-gray-800">Vandrevala Foundation</h3>
            <p className="text-sm text-gray-600">Offers free psychological counseling and crisis mediation.</p>
            <a href="https://www.vandrevalafoundation.com/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">Visit Website</Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
