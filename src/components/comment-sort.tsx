'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CommentSortProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CommentSort({ value, onValueChange }: CommentSortProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort comments" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="best">Best</SelectItem>
        <SelectItem value="top">Top</SelectItem>
        <SelectItem value="new">Newest</SelectItem>
        <SelectItem value="old">Oldest</SelectItem>
        <SelectItem value="controversial">Controversial</SelectItem>
      </SelectContent>
    </Select>
  );
}

