import { useState } from 'react';
import { Button } from "/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "/components/ui/card";
import { Input } from "/components/ui/input";
import { Label } from "/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/components/ui/select";

const OnsenRyokanSystem = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [onsenType, setOnsenType] = useState('');
  const [roomCount, setRoomCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('温泉旅館情報:', {
      name,
      address,
      onsenType,
      roomCount,
      guestCount,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>温泉旅館の情報入力</CardTitle>
        <CardDescription>温泉旅館の情報を入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">温泉旅館の名前</Label>
            <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="mb-4">
            <Label htmlFor="address">住所</Label>
            <Input id="address" value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
          <div className="mb-4">
            <Label htmlFor="onsenType">温泉の種類</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="温泉の種類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="天然温泉" onClick={() => setOnsenType('天然温泉')}>天然温泉</SelectItem>
                <SelectItem value="人工温泉" onClick={() => setOnsenType('人工温泉')}>人工温泉</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <Label htmlFor="roomCount">部屋数</Label>
            <Input id="roomCount" type="number" value={roomCount} onChange={(event) => setRoomCount(Number(event.target.value))} />
          </div>
          <div className="mb-4">
            <Label htmlFor="guestCount">宿泊人数</Label>
            <Input id="guestCount" type="number" value={guestCount} onChange={(event) => setGuestCount(Number(event.target.value))} />
          </div>
          <Button type="submit">情報を送信する</Button>
        </form>
      </CardContent>
      <CardFooter>
        <p>入力した情報はコンソールに表示されます</p>
      </CardFooter>
    </Card>
  );
};

export default OnsenRyokanSystem;
