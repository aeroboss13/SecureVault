import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoSrc from "@/assets/logo.png";
import { Shield, Loader2, Clock, ExternalLink, AlertTriangle, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CopyField from "@/components/copy-field";
import CountdownTimer from "@/components/countdown-timer";
import { downloadAsTextFile } from "@/lib/download-utils";

interface ServiceCredential {
  id: number;
  serviceName: string;
  serviceUrl: string | null;
  username: string;
  password: string;
}

interface SharedPassword {
  services: ServiceCredential[];
  expires: string;
  viewed: boolean;
  comment?: string;
}

export default function ViewPassword() {
  const { token } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [savedConfirmed, setSavedConfirmed] = useState(false);
  const [expiryTimerActive, setExpiryTimerActive] = useState(true);
  
  // Fetch shared password data
  const { data, isLoading, error } = useQuery<SharedPassword>({
    queryKey: [`/api/shared/${token}`],
    staleTime: 0, // Don't cache sensitive data
    retry: 1, // Only retry once
  });
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Ошибка",
        description: "Срок действия ссылки истек, либо ссылка недействительна.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Handle link expiration
  useEffect(() => {
    if (!data || !expiryTimerActive) return;
    
    const expiryTime = new Date(data.expires);
    const now = new Date();
    
    // If already expired, show message and redirect
    if (now >= expiryTime) {
      setExpiryTimerActive(false);
      toast({
        title: "Срок действия истек", 
        description: "Срок действия защищенной ссылки истек.",
        variant: "destructive",
      });
      
      // Redirect after short delay to show toast
      const redirectTimer = setTimeout(() => {
        navigate("/auth");
      }, 3000);
      
      return () => clearTimeout(redirectTimer);
    }
    
    // Set timer to check for expiration
    const timeUntilExpiry = expiryTime.getTime() - now.getTime();
    const expiryTimer = setTimeout(() => {
      setExpiryTimerActive(false);
      toast({
        title: "Срок действия истек",
        description: "Срок действия защищенной ссылки истек.",
        variant: "destructive",
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    }, timeUntilExpiry);
    
    return () => clearTimeout(expiryTimer);
  }, [data, expiryTimerActive, toast, navigate]);
  
  // Мутация для подтверждения сохранения данных
  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!token) return;
      const res = await apiRequest("POST", `/api/shared/${token}/confirm`);
      return res.json();
    },
    onSuccess: () => {
      setSavedConfirmed(true);
      toast({
        title: "Подтверждено",
        description: "Вы подтвердили сохранение данных. Ссылка деактивирована.",
      });
      
      // Для дополнительной безопасности установим таймер, который
      // автоматически закроет страницу или перенаправит пользователя
      setTimeout(() => {
        // Если это единственная вкладка - переход на страницу входа, 
        // в противном случае - попытка закрыть окно
        if (window.history.length > 1) {
          navigate("/auth");
        } else {
          window.close();
        }
      }, 10000); // 10 секунд на прочтение сообщения
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось подтвердить сохранение данных",
        variant: "destructive",
      });
    }
  });
  
  // Handle confirmed save
  const handleConfirmSave = () => {
    confirmMutation.mutate();
  };

  // Handle download data
  const handleDownloadData = () => {
    if (data && data.services) {
      const services = data.services.map(service => ({
        serviceName: service.serviceName,
        serviceUrl: service.serviceUrl,
        username: service.username,
        password: service.password
      }));
      
      downloadAsTextFile(
        services, 
        data.comment || undefined, 
        `access-data-${new Date().toISOString().split('T')[0]}.txt`
      );
      
      toast({
        title: "Файл скачан",
        description: "Данные доступа сохранены в текстовый файл",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto text-primary-600 animate-spin mb-4" />
          <h2 className="text-xl font-medium text-neutral-800">Загрузка данных доступа...</h2>
          <p className="mt-2 text-sm text-neutral-600">Это может занять некоторое время</p>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="bg-red-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Ссылка истекла или недействительна</h2>
              </div>
              <img src={logoSrc} alt="Freshpass" className="h-8 w-8 object-contain" />
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <p className="mb-6 text-neutral-700">
              Срок действия ссылки истек или ссылка недействительна. Пожалуйста, свяжитесь с администратором, который поделился с вами паролем, чтобы получить новую ссылку.
            </p>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.close()}
                className="mr-4"
              >
                Закрыть окно
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Перейти на страницу входа
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8 px-4 bg-neutral-50 flex items-center justify-center">
      <div className="fade-in w-full max-w-3xl mx-auto">
        <Card className="shadow-lg overflow-hidden">
          <div className="bg-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-bold text-white flex items-center">
                <img src={logoSrc} alt="Freshpass" className="h-6 w-6 mr-2" />
                Безопасная передача пароля
              </h2>
              <CountdownTimer expiresAt={new Date(data.expires)} />
            </div>
          </div>

          <CardContent className="px-6 py-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-700 mb-4 p-2">
                <img src={logoSrc} alt="Freshpass" className="h-12 w-12 object-contain" />
              </div>
              <h3 className="text-lg font-heading font-medium text-neutral-900">Данные доступа</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Это ваши данные доступа для нескольких сервисов.
                Эта страница будет самоуничтожена по истечении времени.
              </p>
            </div>

            {/* Комментарий администратора */}
            {data.comment && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Комментарий от администратора</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>{data.comment}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {data.services.map((service, index) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary-600" />
                    {service.serviceName}
                  </h4>
                  
                  <div className="space-y-4">
                    {service.serviceUrl && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          URL сервиса
                        </label>
                        <CopyField value={service.serviceUrl} type="text" />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Имя пользователя
                      </label>
                      <CopyField value={service.username} type="text" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Пароль
                      </label>
                      <CopyField value={service.password} type="password" />
                    </div>
                    
                    {service.serviceUrl && (
                      <div className="text-right mt-2">
                        <a 
                          href={service.serviceUrl.startsWith('http') ? service.serviceUrl : `https://${service.serviceUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                          <ExternalLink className="h-4 w-4 mr-1.5" />
                          Перейти на {service.serviceName}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Срок действия ссылки истечет, когда закончится таймер. Пожалуйста, скопируйте данные доступа в надежное место.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 flex flex-col items-center justify-center rounded-md">
                <p className="text-xs text-neutral-500 mb-3 text-center">
                  Сохраните данные доступа в надежное место или скачайте файл
                </p>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDownloadData}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Скачать данные
                  </Button>
                  
                  <Button 
                    onClick={handleConfirmSave}
                    disabled={savedConfirmed || confirmMutation.isPending}
                    className="flex items-center"
                  >
                    {confirmMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-1.5 animate-spin" />
                        Подтверждение...
                      </>
                    ) : savedConfirmed ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-1.5" />
                        Данные сохранены
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-1.5" />
                        Я сохранил эти данные
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-4 text-sm text-neutral-500">
          <p>Разработано компанией Freshpass</p>
        </div>
      </div>
    </div>
  );
}
